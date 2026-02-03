const puppeteer = require('puppeteer');

(async () => {
  console.log("🚀 크롤러 시동 거는 중...");

  // 1. 브라우저 실행 (서버용 옵션 필수!)
  const browser = await puppeteer.launch({
    headless: "new", // 화면 없이 실행
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // 리눅스 권한 문제 해결
  });

  const page = await browser.newPage();

  // 2. 캠핏 사이트 접속
  console.log("⛺ 캠핏(Camfit) 사이트로 이동 중...");
  await page.goto('https://camfit.co.kr/', { waitUntil: 'networkidle2' });

  // 3. 제목 가져오기
  const title = await page.title();
  console.log(`✅ 접속 성공! 사이트 제목: ${title}`);

  // 4. 종료
  await browser.close();
  console.log("👋 브라우저 종료 완료");
})();
