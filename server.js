require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// ▼▼▼ DB 설정 (본인 비밀번호로 변경!) ▼▼▼
const dbConfig = {
    host: '127.0.0.1',
    user: 'zubzub',
    password: process.env.DB_PASS,
    database: 'zubzub_service'
};

// 등록 API
app.post('/api/register', async (req, res) => {
    const { name, github_id, webhook_url, alert_hour } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            `INSERT INTO developers (name, github_id, webhook_url, alert_hour) VALUES (?, ?, ?, ?)`,
            [name, github_id, webhook_url, alert_hour]
        );
        await connection.end();
        res.json({ success: true, message: "등록 완료! 이제 잔디 안 심으면 혼납니다." });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: "등록 실패 (서버 에러)" });
    }
});

// 삭제 API
app.post('/api/delete', async (req, res) => {
    const { github_id } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(`DELETE FROM developers WHERE github_id = ?`, [github_id]);
        await connection.end();
        
        if (result.affectedRows > 0) res.json({ success: true, message: "감시가 해제되었습니다." });
        else res.json({ success: false, message: "등록된 아이디가 없습니다." });
    } catch (e) {
        res.status(500).json({ success: false, message: "삭제 실패" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 웹 서버 가동: http://localhost:${PORT}`);
});
