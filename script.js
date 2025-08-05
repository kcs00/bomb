document.addEventListener('DOMContentLoaded', () => {
    // 게임 캔버스 설정
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    
    // 게임 변수 초기화
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    // 기본 게임 변수
    let snake = [];
    let food = {};
    
    // 속도 증가 아이템 관련 변수
    let speedItem = {}; // 속도 증가 아이템
    let hasSpeedItem = false; // 속도 아이템 존재 여부
    let speedBoostActive = false; // 속도 증가 상태
    let speedBoostTimer = null; // 속도 증가 타이머
    const SPEED_BOOST_DURATION = 5000; // 속도 증가 지속 시간 (5초)
    
    // 속도 감소 아이템 관련 변수
    let slowItem = {}; // 속도 감소 아이템
    let hasSlowItem = false; // 속도 감소 아이템 존재 여부
    let slowActive = false; // 속도 감소 상태
    let slowTimer = null; // 속도 감소 타이머
    const SLOW_DURATION = 5000; // 속도 감소 지속 시간 (5초)
    
    // 게임 상태 변수
    let normalSpeed = 7; // 기본 속도
    let score = 0;
    let speed = normalSpeed;
    let velocityX = 0;
    let velocityY = 0;
    let gameRunning = false;
    let gameOver = false;
    
    // 방향키 코드
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;
    
    // 버튼 요소
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const scoreElement = document.getElementById('score');
    
    // 게임 초기화 함수
    function initGame() {
        // 게임 상태 초기화
        gameRunning = false;
        gameOver = false;
        score = 0;
        scoreElement.textContent = score;
        
        // 뱀 초기화
        snake = [
            {x: 10, y: 10}
        ];
        
        // 속도 초기화
        normalSpeed = 7;
        speed = normalSpeed;
        
        // 속도 증가 아이템 초기화
        speedBoostActive = false;
        if (speedBoostTimer) {
            clearTimeout(speedBoostTimer);
            speedBoostTimer = null;
        }
        hasSpeedItem = false;
        
        // 속도 감소 아이템 초기화
        slowActive = false;
        if (slowTimer) {
            clearTimeout(slowTimer);
            slowTimer = null;
        }
        hasSlowItem = false;
        
        // 방향 초기화
        velocityX = 0;
        velocityY = 0;
        
        // 음식 생성
        food = generateFood();
    }
    
    // 음식 생성 함수
    function generateFood() {
        let newFood;
        let foodOnSnake;
        
        do {
            foodOnSnake = false;
            newFood = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            
            // 음식이 뱀 위에 생성되지 않도록 확인
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === newFood.x && snake[i].y === newFood.y) {
                    foodOnSnake = true;
                    break;
                }
            }
            
            // 음식이 속도 증가 아이템 위에 생성되지 않도록 확인
            if (hasSpeedItem && newFood.x === speedItem.x && newFood.y === speedItem.y) {
                foodOnSnake = true;
            }
            
            // 음식이 속도 감소 아이템 위에 생성되지 않도록 확인
            if (hasSlowItem && newFood.x === slowItem.x && newFood.y === slowItem.y) {
                foodOnSnake = true;
            }
        } while (foodOnSnake);
        
        return newFood;
    }
    
    // 속도 증가 아이템 생성 함수
    function generateSpeedItem() {
        let newSpeedItem;
        let validPosition = false;
        
        while (!validPosition) {
            newSpeedItem = {
                x: Math.floor(Math.random() * (canvas.width / gridSize)),
                y: Math.floor(Math.random() * (canvas.height / gridSize))
            };
            
            // 뱀과 겹치지 않는지 확인
            let overlapWithSnake = false;
            for (let segment of snake) {
                if (segment.x === newSpeedItem.x && segment.y === newSpeedItem.y) {
                    overlapWithSnake = true;
                    break;
                }
            }
            
            // 음식과 겹치지 않는지 확인
            const overlapWithFood = food.x === newSpeedItem.x && food.y === newSpeedItem.y;
            
            // 속도 감소 아이템과 겹치지 않는지 확인
            const overlapWithSlowItem = hasSlowItem && slowItem.x === newSpeedItem.x && slowItem.y === newSpeedItem.y;
            
            validPosition = !overlapWithSnake && !overlapWithFood && !overlapWithSlowItem;
        }
        
        return newSpeedItem;
    }
    
    // 속도 감소 아이템 생성 함수
    function generateSlowItem() {
        let newSlowItem;
        let validPosition = false;
        
        while (!validPosition) {
            newSlowItem = {
                x: Math.floor(Math.random() * (canvas.width / gridSize)),
                y: Math.floor(Math.random() * (canvas.height / gridSize))
            };
            
            // 뱀과 겹치지 않는지 확인
            let overlapWithSnake = false;
            for (let segment of snake) {
                if (segment.x === newSlowItem.x && segment.y === newSlowItem.y) {
                    overlapWithSnake = true;
                    break;
                }
            }
            
            // 음식과 겹치지 않는지 확인
            const overlapWithFood = food.x === newSlowItem.x && food.y === newSlowItem.y;
            
            // 속도 증가 아이템과 겹치지 않는지 확인
            const overlapWithSpeedItem = hasSpeedItem && speedItem.x === newSlowItem.x && speedItem.y === newSlowItem.y;
            
            validPosition = !overlapWithSnake && !overlapWithFood && !overlapWithSpeedItem;
        }
        
        return newSlowItem;
    }
    
    // 속도 증가 효과 적용 함수
    function activateSpeedBoost() {
        // 속도 감소 효과가 활성화되어 있다면 취소
        if (slowActive) {
            slowActive = false;
            if (slowTimer) {
                clearTimeout(slowTimer);
                slowTimer = null;
            }
        }
        
        speedBoostActive = true;
        speed = normalSpeed * 2; // 속도 2배 증가
        
        // 이미 타이머가 있다면 초기화
        if (speedBoostTimer) {
            clearTimeout(speedBoostTimer);
        }
        
        // 5초 후 속도 원래대로 복구
        speedBoostTimer = setTimeout(() => {
            speedBoostActive = false;
            speed = normalSpeed;
            speedBoostTimer = null;
        }, SPEED_BOOST_DURATION);
    }
    
    // 속도 감소 효과 적용 함수
    function activateSlow() {
        // 속도 증가 효과가 활성화되어 있다면 취소
        if (speedBoostActive) {
            speedBoostActive = false;
            if (speedBoostTimer) {
                clearTimeout(speedBoostTimer);
                speedBoostTimer = null;
            }
        }
        
        slowActive = true;
        speed = normalSpeed / 2; // 속도 절반으로 감소
        
        // 이미 타이머가 있다면 초기화
        if (slowTimer) {
            clearTimeout(slowTimer);
        }
        
        // 5초 후 속도 원래대로 복구
        slowTimer = setTimeout(() => {
            slowActive = false;
            speed = normalSpeed;
            slowTimer = null;
        }, SLOW_DURATION);
    }
    
    // 게임 루프
    function gameLoop() {
        if (!gameRunning || gameOver) return;
        
        setTimeout(() => {
            clearCanvas();
            moveSnake();
            checkCollision();
            drawFood();
            if (hasSpeedItem) {
                drawSpeedItem();
            }
            if (hasSlowItem) {
                drawSlowItem();
            }
            drawSnake();
            drawSpeedBoostIndicator();
            drawSlowIndicator();
            
            if (!gameOver) {
                gameLoop();
            } else {
                drawGameOver();
            }
        }, 1000 / speed);
    }
    
    // 캔버스 지우기
    function clearCanvas() {
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // 뱀 이동 함수
    function moveSnake() {
        // 새로운 머리 위치 계산
        const head = {x: snake[0].x + velocityX, y: snake[0].y + velocityY};
        snake.unshift(head);
        
        // 먹이를 먹었는지 확인
        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreElement.textContent = score;
            food = generateFood();
            
            // 점수에 따라 기본 속도 증가
            if (score % 5 === 0) {
                normalSpeed += 1;
                if (!speedBoostActive && !slowActive) {
                    speed = normalSpeed;
                }
            }
            
            // 10% 확률로 속도 증가 아이템 생성
            if (!hasSpeedItem && Math.random() < 0.1) {
                speedItem = generateSpeedItem();
                hasSpeedItem = true;
            }
            
            // 10% 확률로 속도 감소 아이템 생성
            if (!hasSlowItem && Math.random() < 0.1) {
                slowItem = generateSlowItem();
                hasSlowItem = true;
            }
        } 
        // 속도 증가 아이템을 먹었는지 확인
        else if (hasSpeedItem && head.x === speedItem.x && head.y === speedItem.y) {
            hasSpeedItem = false;
            activateSpeedBoost();
            snake.pop(); // 아이템을 먹어도 길이는 증가하지 않음
        }
        // 속도 감소 아이템을 먹었는지 확인
        else if (hasSlowItem && head.x === slowItem.x && head.y === slowItem.y) {
            hasSlowItem = false;
            activateSlow();
            snake.pop(); // 아이템을 먹어도 길이는 증가하지 않음
        } else {
            // 먹이나 아이템을 먹지 않았다면 꼬리 제거
            snake.pop();
        }
    }
    
    // 속도 증가 아이템 그리기 함수
    function drawSpeedItem() {
        ctx.fillStyle = '#00BFFF'; // 파란색 아이템
        ctx.beginPath();
        ctx.arc(
            (speedItem.x * gridSize) + gridSize / 2,
            (speedItem.y * gridSize) + gridSize / 2,
            gridSize / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    
    // 속도 감소 아이템 그리기 함수
    function drawSlowItem() {
        ctx.fillStyle = '#FF8C00'; // 주황색 아이템
        ctx.beginPath();
        ctx.arc(
            (slowItem.x * gridSize) + gridSize / 2,
            (slowItem.y * gridSize) + gridSize / 2,
            gridSize / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    
    // 속도 증가 상태 표시 함수
    function drawSpeedBoostIndicator() {
        if (speedBoostActive) {
            ctx.fillStyle = 'rgba(0, 191, 255, 0.3)';
            ctx.fillRect(0, 0, canvas.width, 5);
            ctx.fillRect(0, 0, 5, canvas.height);
            ctx.fillRect(canvas.width - 5, 0, 5, canvas.height);
            ctx.fillRect(0, canvas.height - 5, canvas.width, 5);
            
            // 속도 증가 텍스트 표시
            ctx.font = '16px Arial';
            ctx.fillStyle = '#00BFFF';
            ctx.textAlign = 'center';
            ctx.fillText('속도 증가!', canvas.width / 2, 20);
        }
    }
    
    // 속도 감소 상태 표시 함수
    function drawSlowIndicator() {
        if (slowActive) {
            ctx.fillStyle = 'rgba(255, 140, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, 5);
            ctx.fillRect(0, 0, 5, canvas.height);
            ctx.fillRect(canvas.width - 5, 0, 5, canvas.height);
            ctx.fillRect(0, canvas.height - 5, canvas.width, 5);
            
            // 속도 감소 텍스트 표시
            ctx.font = '16px Arial';
            ctx.fillStyle = '#FF8C00';
            ctx.textAlign = 'center';
            ctx.fillText('속도 감소!', canvas.width / 2, 20);
        }
    }
    
    // 충돌 확인 함수
    function checkCollision() {
        const head = snake[0];
        
        // 벽과의 충돌 확인
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver = true;
            return;
        }
        
        // 자신의 몸과의 충돌 확인
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver = true;
                return;
            }
        }
    }
    
    // 먹이 그리기 함수
    function drawFood() {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    }
    
    // 뱀 그리기 함수
    function drawSnake() {
        ctx.fillStyle = '#4CAF50';
        
        // 뱀의 몸통
        for (let i = 0; i < snake.length; i++) {
            ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 1, gridSize - 1);
        }
        
        // 뱀의 머리는 다른 색상으로
        ctx.fillStyle = '#45a049';
        ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 1, gridSize - 1);
    }
    
    // 게임 오버 메시지 표시
    function drawGameOver() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('게임 오버!', canvas.width / 2, canvas.height / 2 - 15);
        
        ctx.font = '20px Arial';
        ctx.fillText(`점수: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
    }
    
    // 키보드 이벤트 처리
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        // 현재 진행 방향의 반대 방향으로는 이동 불가
        switch (e.keyCode) {
            case LEFT:
                if (velocityX !== 1) { // 오른쪽으로 이동 중이 아닐 때만
                    velocityX = -1;
                    velocityY = 0;
                }
                break;
            case UP:
                if (velocityY !== 1) { // 아래로 이동 중이 아닐 때만
                    velocityX = 0;
                    velocityY = -1;
                }
                break;
            case RIGHT:
                if (velocityX !== -1) { // 왼쪽으로 이동 중이 아닐 때만
                    velocityX = 1;
                    velocityY = 0;
                }
                break;
            case DOWN:
                if (velocityY !== -1) { // 위로 이동 중이 아닐 때만
                    velocityX = 0;
                    velocityY = 1;
                }
                break;
        }
    });
    
    // 시작 버튼 이벤트
    startBtn.addEventListener('click', () => {
        if (!gameRunning) {
            gameRunning = true;
            if (velocityX === 0 && velocityY === 0) {
                // 처음 시작할 때는 오른쪽으로 이동
                velocityX = 1;
                velocityY = 0;
            }
            gameLoop();
            startBtn.textContent = '일시 정지';
        } else {
            gameRunning = false;
            startBtn.textContent = '게임 시작';
        }
    });
    
    // 리셋 버튼 이벤트
    resetBtn.addEventListener('click', () => {
        gameRunning = false;
        initGame();
        clearCanvas();
        drawSnake();
        drawFood();
        startBtn.textContent = '게임 시작';
    });
    
    // 게임 초기화 및 첫 화면 그리기
    initGame();
    clearCanvas();
    drawSnake();
    drawFood();
});