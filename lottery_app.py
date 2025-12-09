from flask import Flask, render_template
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time

app = Flask(__name__)

def get_lottery_numbers():
    """取得威力彩開獎號碼"""
    # 設定 Chrome 選項
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # 無頭模式，不開啟瀏覽器視窗
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    try:
        # 初始化 WebDriver
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        # 前往台灣彩券網站
        driver.get('https://www.taiwanlottery.com/')
        
        # 等待 JavaScript 載入
        time.sleep(2)  # 根據需要調整等待時間
        
        # 使用 BeautifulSoup 解析頁面
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        driver.quit()
        
        # 找 class="result-balls" 的區塊
        result_balls = soup.find_all('div', class_='result-balls')
        
        if not result_balls or len(result_balls) < 2:
            raise Exception("找不到開獎資料")
        
        # 取得威力彩區塊（通常是第二個）
        result_ball = result_balls[1]
        
        # 找出所有號碼球
        ball_numbers = result_ball.find_all('div', class_='ball')
        
        if not ball_numbers or len(ball_numbers) < 7:
            raise Exception(f"號碼數量不足（需要7個，只找到{len(ball_numbers)}個）")
        
        # 威力彩號碼大小順序（前6個）
        regular_numbers = []
        for n in range(6):
            number = ball_numbers[n].text.strip()
            regular_numbers.append(number.zfill(2))  # 補零
        
        # 第二區（第7個號碼）
        special_number = ball_numbers[6].text.strip().zfill(2)
        
        # 返回符合模板格式的資料
        return {
            'success': True,
            'regular_numbers': regular_numbers,
            'special_number': special_number,
            'source': 'live'
        }
        
    except Exception as e:
        # 發生錯誤時返回測試資料
        return {
            'success': True,
            'regular_numbers': ['03', '08', '15', '22', '27', '34'],
            'special_number': '18',
            'note': '⚠️ 無法連線至官網，顯示測試資料',
            'source': 'sample'
        }

@app.route('/')
def index():
    """首頁：顯示威力彩開獎號碼"""
    lottery_data = get_lottery_numbers()
    return render_template('index.html', data=lottery_data)

@app.route('/refresh')
def refresh():
    """重新爬取號碼"""
    lottery_data = get_lottery_numbers()
    return render_template('index.html', data=lottery_data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)