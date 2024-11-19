document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('div[class*="language-"]').forEach(function(block) {
        // 创建复制按钮
        let copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = '复制';
        
        // 获取代码块
        let code = block.querySelector("div.highlight");
        let preElement = code.querySelector('pre');
        
        // 将复制按钮插入到pre元素之前
        code.insertBefore(copyButton, preElement);

        // 添加点击事件
        copyButton.addEventListener('click', function() {
            let codeBlock = code.querySelector('pre code');
            if (!codeBlock) return;
            
            let codeContent = codeBlock.textContent;
            
            navigator.clipboard.writeText(codeContent).then(function() {
                // 更改按钮文本
                copyButton.textContent = '成功';
                setTimeout(function() {
                    copyButton.textContent = '复制';
                }, 2000);
            }).catch(function(err) {
                console.error('Failed to copy text: ', err);
            });
        });
    });
});
