require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2/promise');
const moment = require('moment');

// ▼▼▼ DB 설정 (본인 비밀번호로 꼭 변경하세요!) ▼▼▼
const dbConfig = {
    host: '127.0.0.1',
    user: 'zubzub',
    password: 'process.env.DB_PASS', 
    database: 'zubzub_service'
};

// 디스코드 알림 발송 함수
async function sendDiscord(webhookUrl, message) {
    try {
        await axios.post(webhookUrl, {
            content: message,
            embeds: [{
                title: "🌱 잔디 보안관 경보",
                description: "오늘 커밋 기록이 없습니다!",
                color: 15158332, // 빨간색
                footer: { text: "일일 커밋 보안관" },
                timestamp: new Date()
            }]
        });
        console.log("📤 디스코드 알림 전송 성공");
    } catch (e) {
        console.log("❌ 디스코드 전송 실패:", e.message);
    }
}

// 깃허브 잔디 확인 함수 (차단 우회 버전)
async function checkGithub(githubId) {
    try {
        // [핵심 수정] 프로필 메인 대신 '잔디 데이터 전용 페이지'로 접속 (봇 차단 회피)
        const url = `https://github.com/users/${githubId}/contributions`;
        
        const { data } = await axios.get(url, {
            headers: {
                // "나 로봇 아니고 크롬 브라우저야~" 하고 속이는 명찰(User-Agent)
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': `https://github.com/${githubId}`
            }
        });
        
        const $ = cheerio.load(data);
        const today = moment().format('YYYY-MM-DD');
        
        // 데이터 페이지는 구조가 단순해서 날짜로 바로 찾을 수 있음
        const todayRect = $(`[data-date="${today}"]`);
        
        // 1. 그래도 못 찾았다? (진짜 없는 아이디거나 깃허브가 작정하고 막음)
        if (todayRect.length === 0) {
            console.log(`⚠️ [오류] ${githubId}님의 데이터를 읽을 수 없습니다.`);
            return false; // 일단 알림을 보내서 사용자가 확인하게 함
        }

        // 2. 잔디 레벨 확인 (data-level 속성이 없으면 0으로 간주)
        const level = todayRect.attr('data-level') || "0"; 
        
        console.log(`🔎 [진단] ${githubId}님의 오늘 잔디 레벨: ${level}`);

        // 0이면 false(안함 -> 알림감), 0이 아니면 true(함 -> 통과)
        return level !== "0"; 

    } catch (e) {
        console.log(`🔥 접속 에러 (${githubId}):`, e.message);
        // 404면 아이디가 없는 것
        if (e.response && e.response.status === 404) {
             console.log("👉 존재하지 않는 GitHub 아이디입니다.");
        }
        return false; // 에러나면 일단 알림 보냄
    }
}

(async () => {
    console.log("👮 [잔디 보안관] 24시간 감시 시작 (뒷문 접속 모드)");

    while (true) {
        // 한국 시간 계산 (서버시간 + 9)
        const currentHour = (new Date().getHours() + 9) % 24;
        const todayStr = moment().format('YYYY-MM-DD');

        console.log(`\n⏰ 현재시각: ${currentHour}시 / 순찰 도는 중...`);

        let connection;
        try {
            connection = await mysql.createConnection(dbConfig);
            const [users] = await connection.execute("SELECT * FROM developers");

            for (const user of users) {
                // 1. 설정한 시간이 되었거나 지났는지 확인
                if (currentHour >= user.alert_hour) {
                    
                    // 2. 오늘 이미 알림을 받았는지 확인
                    const lastAlert = user.last_alert_date ? moment(user.last_alert_date).format('YYYY-MM-DD') : '';
                    if (lastAlert === todayStr) continue;

                    console.log(`🔍 [검사 대상] ${user.name}님 (알림설정: ${user.alert_hour}시)`);

                    // 3. 잔디 확인
                    const hasCommitted = await checkGithub(user.github_id);

                    if (!hasCommitted) {
                        console.log(`🚨 [검거] ${user.name}님 미커밋! 검거!`);
                        
                        await sendDiscord(
                            user.webhook_url, 
                            `🚨 **[긴급] ${user.name}님!**\n설정하신 ${user.alert_hour}시가 지났는데 아직 잔디가 없습니다!\n얼른 심으러 가세요!`
                        );
                        
                        // 오늘 알림 보냈다고 도장 찍기
                        await connection.execute("UPDATE developers SET last_alert_date = ? WHERE id = ?", [todayStr, user.id]);
                    } else {
                        console.log(`✅ [통과] ${user.name}님은 안전합니다.`);
                    }
                    
                    // 너무 빨리 요청하면 차단당하니까 1초 쉬기
                    await new Promise(r => setTimeout(r, 1000)); 
                }
            }
            await connection.end();

        } catch (e) {
            console.error("시스템 에러:", e);
            if(connection) await connection.end();
        }

        // 1시간 대기
        console.log("💤 1시간 뒤에 다시 돕니다...");
        await new Promise(r => setTimeout(r, 3600000)); 
    }
})();
