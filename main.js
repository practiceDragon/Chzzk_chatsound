const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
require('dotenv').config();
const { delay } = require('./delay')

// 네이버 아이디와, 비밀번호를 환경변수 값으로 대체함.
// NAVER_ID = "iddlqslek"
// NAVER_PASSWORD = "votmdnjem123" 처럼 대체해도 됨.
// 그러나, 최상단 폴더에 ".env"파일을 생성하여 로컬 환경변수를 만드는 걸 추천합니다.
// Github으로 crawling.js파일을 공유한다면, 나의 NAVER_ID와 NAVER_PASSWORD를 다른 이에게 공유하게 되기 때문.
const NAVER_ID = process.env.NAVER_ID
const NAVER_PASSWORD = process.env.NAVER_PASSWORD
const CHZZK_LIVE_LINK = process.env.CHZZK_LIVE_LINK

async function startBrowser() {
  // 브라우저 객체 얻기
  const browser = await puppeteer.launch({ headless: false }); // headless: false는 브라우저를 포그라운드로 실행. true는 백그라운드
  // const page = await browser.newPage(); // 브라우저 페이지 생성
  const [page] = await browser.pages();
  // page.setViewport({ width: 1000, height: 1000 })

  // 브라우저 페이지 링크를 "네이버 로그인" 링크로 이동
  await page.goto('https://nid.naver.com/nidlogin.login');

  await page.evaluate((id, pw) => {
    document.querySelector('#id').value = id;
    document.querySelector('#pw').value = pw;
  }, NAVER_ID, NAVER_PASSWORD);

  // "네이버 로그인" 페이지에서 로그인 버튼을 클릭 함.
  await page.click('.btn_login');
  await page.waitForNavigation(3000); // 완전히 로그인이 진행되어, 로그인 완료페이지로 이동할 때까지 대기함.

  // 지정한 페이지로 이동한다.
  await page.goto(CHZZK_LIVE_LINK);

  // "치즈 아이콘"이 나타날 때까지 기다림 (최대 10초)
  await page.waitForSelector('#layout-body > section > aside > div.live_chatting_area__hUPJw > div.live_chatting_input_container__qA0ad > button:nth-child(3) > svg', { timeout: 10000 });

  // 아이콘의 셀렉터를 정의합니다.
  const iconSelector = '#layout-body > section > aside > div.live_chatting_area__hUPJw > div.live_chatting_input_container__qA0ad > button:nth-child(3) > svg';
  // 치즈 아이콘 클릭
  console.log('치즈 아이콘 클릭')
  const strokeWidth = await page.$eval(`${iconSelector} > path:first-child`, path => path.getAttribute('stroke-width'));

  console.log('strokeWidth:', strokeWidth);
  if(!strokeWidth) {
    console.log('치즈 아이콘이 존재합니다')
    await delay(10000) // 10초 대기
    await page.click(iconSelector);


    // 규칙사항의 셀렉터를 정의합니다.
    const ruleSelector = '#layout-body > section > aside > div.live_chatting_popup_rule_container__gnQS8 > button.live_chatting_popup_rule_agree_button__cJJd3';
    // 규칙사항이 존재하는지 확인합니다.
    const rule = await page.$(ruleSelector) !== null;
    if(rule) {
      console.log('규칙이 존재합니다.')
      await page.click(ruleSelector);
      await delay(1000) // 1초 대기
      console.log('치즈 아이콘을 다시 클릭합니다.')
      await page.click(iconSelector);
    }
  } else {
    console.log('해당 방송은 치즈 후원이 켜져있지 않습니다.');
    console.log('치즈 후원을 켜주세요.')
    await browser.close(); // 브라우저 닫기
    return;
  }

  // 3초 대기
  console.log('5초 대기')
  await delay(5000)

  let first = true;
  let lastText = '';
  while (true) {
    console.log('------- 시작 ---------')
    await delay(1000); // 1초마다 대기
  
    console.log('치즈 후원창의 텍스트 입력필드에 커서를 올리기');
    // 처음에는 textarea에 포커스를 맞춥니다.
    let selector = first 
      ? '#layout-body > section > aside > div.live_chatting_area__hUPJw > div.live_chatting_popup_donation_container__-Xbda > div.live_chatting_popup_donation_content__W8X4L > div:nth-child(5) > div > div.live_chatting_donation_message_wrapper__SNoBH > div.live_chatting_donation_message_input_wrapper__04s9x > textarea'
      : '#layout-body > section > aside > div.live_chatting_area__hUPJw > div.live_chatting_popup_donation_container__-Xbda > div.live_chatting_popup_donation_content__W8X4L > div:nth-child(5) > div > div.live_chatting_donation_message_wrapper__SNoBH > div.live_chatting_donation_message_input_wrapper__04s9x > pre';

    await page.focus(selector);
  
    console.log('텍스트 선택');
    let currentText = await page.evaluate(() => {
      const element = document.querySelector('#layout-body > section > aside > div.live_chatting_list_container__vwsbZ.live_chatting_list_exist_fixed_message__2EP21 > div > div:nth-last-child(2) > div > button > span.live_chatting_message_text__DyleH');
      return element ? element.innerText.trim() : '';
    });
  
    if (currentText && currentText !== lastText) {
      console.log('텍스트 삭제');
      await page.evaluate(() => {
        const preElement = document.querySelector('pre');
        preElement.innerText = ''; // pre 태그의 텍스트를 비움
      });

      console.log('텍스트 입력');
      await page.keyboard.type(currentText, { delay: 100 }); // 텍스트 입력
      console.log('텍스트 입력 완료')
  
      console.log('스피커 아이콘 클릭');
      await page.click('#layout-body > section > aside > div.live_chatting_area__hUPJw > div.live_chatting_popup_donation_container__-Xbda > div.live_chatting_popup_donation_content__W8X4L > div:nth-child(4) > div > div.live_chatting_popup_donation_preview__TOHTj > button > svg');
  
      lastText = currentText; // 이전 텍스트 업데이트
    } else {
      console.log('아직 텍스트가 없습니다.');
    }
    console.log('텍스트 출력 완료')
  
    first = false; // 처음 실행 후에는 first 값을 false로 변경하여 다음에는 pre 요소에 포커스를 맞출 수 있게 합니다.
  }

  await browser.close(); // 브라우저 닫기
}

startBrowser();