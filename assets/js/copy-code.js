document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('div[class*=language-]').forEach(function(block) {
        // 创建复制按钮
        let copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = '复制';
        
        // 获取代码块
        let code = block.querySelector("div.highlight");
        if(!code) return;
        
        // 将复制按钮插入到pre元素之前
        block.insertBefore(copyButton, code);

        // 添加点击事件
        copyButton.addEventListener('click', function() {
            let codeContent = code.querySelector('code').textContent;
            
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


