(function() {
    'use strict';
    
    console.log('视频自动播放控制器已启动（修复版v2）');
    
    // 配置参数
    const CONFIG = {
        checkInterval: 20000,        // 检查间隔：20秒（修改）
        mouseMoveInterval: 30000,    // 鼠标移动间隔：30秒
        pauseThreshold: 3,           // 连续暂停次数阈值
        enableMouseMove: true,       // 是否启用鼠标移动
        enableAutoNext: true         // 是否启用自动下一个
    };
    
    // 状态管理
    let pauseCount = 0;
    let isRunning = true;
    let checkTimer = null;
    let mouseMoveTimer = null;
    let lastClickTime = 0;           // 防止重复点击（新增）
    
    // 检查视频是否在播放
    function isVideoPlaying() {
        const playerContainer = document.querySelector('#videocontainer');
        if (!playerContainer) {
            console.log('未找到播放器容器');
            return false;
        }
        
        // 增加更多检查方法（修复）
        const isPlayingByClass = playerContainer.classList.contains('jw-state-playing');
        
        // 尝试通过video元素检查
        const videoElement = playerContainer.querySelector('video');
        let isPlayingByVideo = false;
        if (videoElement) {
            isPlayingByVideo = !videoElement.paused && !videoElement.ended && videoElement.readyState > 2;
        }
        
        const isPlaying = isPlayingByClass || isPlayingByVideo;
        console.log(`播放状态检查: class=${isPlayingByClass}, video=${isPlayingByVideo}, 最终=${isPlaying}`);
        return isPlaying;
    }
    
    // 多种方法查找并点击下一个按钮
    function clickNextButton() {
        // 防止频繁点击（新增）
        const now = Date.now();
        if (now - lastClickTime < 5000) {
            console.log('距离上次点击时间过短，跳过');
            return false;
        }
        
        console.log('开始查找下一个按钮...');
        
        let targetButton = null;
        
        // 方法1：通过文本内容查找
        const allButtons = document.querySelectorAll('button');
        for (let button of allButtons) {
            if (!button.offsetParent) continue; // 跳过不可见的按钮（修复）
            
            const buttonText = (button.textContent || button.innerText || '').trim();
            if (buttonText.includes('下一个') || buttonText.includes('下一课') || buttonText.includes('next')) {
                targetButton = button;
                console.log('方法1找到按钮:', button);
                break;
            }
        }
        
        // 方法2：通过类名和结构查找
        if (!targetButton) {
            const buttons = document.querySelectorAll('button.yxtf-button, button[class*="next"], button[class*="下一"]');
            for (let button of buttons) {
                if (!button.offsetParent) continue; // 跳过不可见的按钮（修复）
                
                const span = button.querySelector('span');
                const buttonText = (button.textContent || button.innerText || '').trim();
                if (span && (span.textContent.includes('下一个') || span.innerText.includes('下一个')) || 
                    buttonText.includes('下一个') || buttonText.includes('下一课')) {
                    targetButton = button;
                    console.log('方法2找到按钮:', button);
                    break;
                }
            }
        }
        
        // 方法3：通过图标查找
        if (!targetButton) {
            const iconSelectors = [
                '.yxtf-icon-arrow-right',
                '[class*="icon-next"]', 
                '[class*="arrow-right"]',
                'i[class*="right"]'
            ];
            
            for (let selector of iconSelectors) {
                const icons = document.querySelectorAll(selector);
                for (let icon of icons) {
                    const button = icon.closest('button');
                    if (button && button.offsetParent) { // 确保按钮可见（修复）
                        const buttonText = (button.textContent || button.innerText || '').trim();
                        if (buttonText.includes('下一个') || buttonText.includes('下一课') || buttonText.includes('next')) {
                            targetButton = button;
                            console.log('方法3找到按钮:', button);
                            break;
                        }
                    }
                }
                if (targetButton) break;
            }
        }
        
        // 方法4：通过aria-label或title查找（新增）
        if (!targetButton) {
            const ariaButtons = document.querySelectorAll('button[aria-label*="下一"], button[title*="下一"], button[aria-label*="next"], button[title*="next"]');
            for (let button of ariaButtons) {
                if (button.offsetParent) {
                    targetButton = button;
                    console.log('方法4找到按钮（aria-label/title）:', button);
                    break;
                }
            }
        }
        
        if (!targetButton) {
            console.log('未找到下一个按钮，尝试打印所有可见按钮信息：');
            const visibleButtons = Array.from(document.querySelectorAll('button')).filter(btn => btn.offsetParent);
            visibleButtons.forEach((btn, index) => {
                console.log(`按钮${index}:`, {
                    text: (btn.textContent || '').trim(),
                    className: btn.className,
                    ariaLabel: btn.getAttribute('aria-label'),
                    title: btn.title,
                    html: btn.outerHTML.substring(0, 200)
                });
            });
            return false;
        }
        
        console.log('找到目标按钮，准备点击:', targetButton);
        lastClickTime = now; // 记录点击时间（新增）
        
        // 多种点击方法尝试
        return attemptClick(targetButton);
    }
    
    // 尝试多种点击方法
    function attemptClick(button) {
        if (!button || !button.offsetParent) {
            console.log('按钮无效或不可见');
            return false;
        }
        
        const methods = [
            // 方法1：直接click()
            () => {
                console.log('尝试方法1: 直接click()');
                button.click();
                return true;
            },
            
            // 方法2：MouseEvent点击
            () => {
                console.log('尝试方法2: MouseEvent点击');
                const rect = button.getBoundingClientRect();
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    button: 0,
                    buttons: 1,
                    clientX: rect.left + rect.width / 2,
                    clientY: rect.top + rect.height / 2
                });
                button.dispatchEvent(clickEvent);
                return true;
            },
            
            // 方法3：完整的鼠标事件序列
            () => {
                console.log('尝试方法3: 完整鼠标事件序列');
                const rect = button.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                
                // mousedown -> mouseup -> click
                ['mousedown', 'mouseup', 'click'].forEach(eventType => {
                    const event = new MouseEvent(eventType, {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        button: 0,
                        buttons: eventType === 'mousedown' ? 1 : 0,
                        clientX: x,
                        clientY: y
                    });
                    button.dispatchEvent(event);
                });
                return true;
            },
            
            // 方法4：触发焦点和键盘事件
            () => {
                console.log('尝试方法4: 焦点和键盘事件');
                button.focus();
                
                const enterEvent = new KeyboardEvent('keydown', {
                    bubbles: true,
                    cancelable: true,
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13
                });
                button.dispatchEvent(enterEvent);
                
                // 延迟一点再click
                setTimeout(() => button.click(), 100);
                return true;
            },
            
            // 方法5：模拟用户交互
            () => {
                console.log('尝试方法5: 模拟用户交互');
                
                // 先移动鼠标到按钮上
                const rect = button.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                
                const mouseMoveEvent = new MouseEvent('mousemove', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: x,
                    clientY: y
                });
                document.dispatchEvent(mouseMoveEvent);
                
                // 延迟后点击
                setTimeout(() => {
                    button.focus();
                    button.click();
                }, 200);
                
                return true;
            }
        ];
        
        // 逐个尝试每种方法
        for (let i = 0; i < methods.length; i++) {
            try {
                methods[i]();
                console.log(`点击方法${i + 1}执行完成`);
                
                // 检查是否成功（延迟检查）
                setTimeout(() => {
                    console.log('检查点击效果...');
                }, 1000);
                
                return true;
            } catch (error) {
                console.error(`点击方法${i + 1}失败:`, error);
            }
        }
        
        return false;
    }
    
    // 模拟鼠标移动
    function simulateMouseMove() {
        if (!CONFIG.enableMouseMove) return;
        
        const playerContainer = document.querySelector('#videocontainer');
        if (!playerContainer) return;
        
        const rect = playerContainer.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return; // 确保容器有有效尺寸（修复）
        
        const randomX = rect.left + Math.random() * rect.width;
        const randomY = rect.top + Math.random() * rect.height;
        
        const mouseMoveEvent = new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: randomX,
            clientY: randomY
        });
        
        document.dispatchEvent(mouseMoveEvent);
        playerContainer.dispatchEvent(mouseMoveEvent);
        console.log(`模拟鼠标移动到: (${Math.round(randomX)}, ${Math.round(randomY)})`);
    }
    
    // 主要检查逻辑
    function checkVideoStatus() {
        if (!isRunning) return;
        
        console.log('=== 开始检查视频状态 ===');
        
        try {
            const isPlaying = isVideoPlaying();
            
            if (!isPlaying) {
                pauseCount++;
                console.log(`视频未在播放，暂停计数: ${pauseCount}/${CONFIG.pauseThreshold}`);
                
                if (pauseCount >= CONFIG.pauseThreshold && CONFIG.enableAutoNext) {
                    console.log('达到暂停阈值，尝试点击下一个');
                    const success = clickNextButton();
                    if (success) {
                        pauseCount = 0;
                        console.log('成功点击下一个，重置计数器');
                    } else {
                        console.log('点击下一个失败');
                    }
                }
            } else {
                if (pauseCount > 0) {
                    console.log('视频恢复播放，重置暂停计数');
                    pauseCount = 0;
                }
            }
        } catch (error) {
            console.error('检查视频状态时出错:', error);
        }
        
        console.log('=== 检查完成 ===\n');
    }
    
    // 启动定时器
    function startTimers() {
        // 先清理现有定时器（修复）
        stopTimers();
        
        checkTimer = setInterval(checkVideoStatus, CONFIG.checkInterval);
        
        if (CONFIG.enableMouseMove) {
            mouseMoveTimer = setInterval(simulateMouseMove, CONFIG.mouseMoveInterval);
        }
        
        console.log(`定时器已启动 - 状态检查: ${CONFIG.checkInterval}ms, 鼠标移动: ${CONFIG.mouseMoveInterval}ms`);
    }
    
    // 停止定时器
    function stopTimers() {
        if (checkTimer) {
            clearInterval(checkTimer);
            checkTimer = null;
        }
        if (mouseMoveTimer) {
            clearInterval(mouseMoveTimer);
            mouseMoveTimer = null;
        }
        console.log('定时器已停止');
    }
    
    // 调试函数：查找所有可能的按钮
    function debugButtons() {
        console.log('=== 调试：查找所有按钮 ===');
        
        const allButtons = document.querySelectorAll('button');
        const visibleButtons = Array.from(allButtons).filter(btn => btn.offsetParent);
        
        console.log(`总共找到 ${allButtons.length} 个按钮，其中 ${visibleButtons.length} 个可见:`);
        
        visibleButtons.forEach((btn, index) => {
            console.log(`按钮 ${index + 1}:`, {
                text: (btn.textContent || '').trim(),
                className: btn.className,
                id: btn.id,
                disabled: btn.disabled,
                ariaLabel: btn.getAttribute('aria-label'),
                title: btn.title,
                html: btn.outerHTML.substring(0, 150) + '...'
            });
        });
        
        // 特别查找包含"下一个"的元素
        const nextElements = document.querySelectorAll('*');
        const nextCandidates = [];
        nextElements.forEach(el => {
            if (el.textContent && (el.textContent.includes('下一个') || el.textContent.includes('下一课'))) {
                nextCandidates.push(el);
            }
        });
        
        console.log(`找到 ${nextCandidates.length} 个包含"下一个"的元素:`);
        nextCandidates.forEach((el, index) => {
            console.log(`候选 ${index + 1}:`, {
                tagName: el.tagName,
                text: (el.textContent || '').trim(),
                className: el.className,
                visible: el.offsetParent !== null,
                clickable: el.tagName === 'BUTTON' || el.onclick !== null || el.style.cursor === 'pointer'
            });
        });
    }
    
    // 控制函数
    window.videoController = {
        start: function() {
            if (isRunning) {
                console.log('控制器已在运行中');
                return;
            }
            isRunning = true;
            startTimers();
            console.log('视频控制器已启动');
        },
        
        stop: function() {
            isRunning = false;
            stopTimers();
            pauseCount = 0;
            lastClickTime = 0; // 重置点击时间（新增）
            console.log('视频控制器已停止');
        },
        
        status: function() {
            console.log('控制器状态:', {
                isRunning: isRunning,
                pauseCount: pauseCount,
                lastClickTime: new Date(lastClickTime).toLocaleTimeString(),
                config: CONFIG
            });
        },
        
        config: function(newConfig) {
            if (newConfig) {
                Object.assign(CONFIG, newConfig);
                console.log('配置已更新:', CONFIG);
                
                if (isRunning) {
                    stopTimers();
                    startTimers();
                }
            }
            return CONFIG;
        },
        
        clickNext: function() {
            return clickNextButton();
        },
        
        debug: function() {
            debugButtons();
        },
        
        // 新增：立即检查一次（调试用）
        checkNow: function() {
            checkVideoStatus();
        }
    };
    
    // 自动启动
    startTimers();
    
    // 页面卸载时清理
    window.addEventListener('beforeunload', function() {
        stopTimers();
    });
    
    // 页面隐藏/显示时的处理（新增）
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            console.log('页面被隐藏，暂停控制器');
        } else {
            console.log('页面重新显示，恢复控制器');
        }
    });
    
    console.log('视频自动播放控制器初始化完成（修复版v2）');
    console.log('主要改进：');
    console.log('- 监测时间改为20秒');
    console.log('- 增加了防重复点击机制');
    console.log('- 改进了按钮查找逻辑');
    console.log('- 增加了更多错误处理');
    console.log('- 改进了播放状态检测');
    console.log('');
    console.log('可用命令:');
    console.log('- videoController.debug()     // 调试按钮信息');
    console.log('- videoController.clickNext() // 手动测试点击');
    console.log('- videoController.checkNow()  // 立即检查一次');
    console.log('- videoController.stop()      // 停止控制器');
    console.log('- videoController.start()     // 启动控制器');
    console.log('- videoController.status()    // 查看状态');
    
    // 初始调试
    setTimeout(() => {
        console.log('执行初始调试...');
        debugButtons();
    }, 2000);
    
})(); 