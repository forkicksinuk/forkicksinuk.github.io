document.addEventListener('DOMContentLoaded', function() {
    // 为每个代码块添加复制按钮
    document.querySelectorAll('pre').forEach(function(preBlock) {
        // 创建复制按钮
        var copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        
        // 将pre块包装在一个相对定位的容器中
        var wrapper = document.createElement('div');
        wrapper.className = 'code-wrapper';
        preBlock.parentNode.insertBefore(wrapper, preBlock);
        wrapper.appendChild(preBlock);
        wrapper.appendChild(copyButton);

        // 添加点击事件
        copyButton.addEventListener('click', function() {
            var codeBlock = preBlock.querySelector('code') || preBlock;
            var code = codeBlock.textContent;
            
            navigator.clipboard.writeText(code).then(function() {
                // 更改按钮状态
                copyButton.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(function() {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            }).catch(function(err) {
                console.error('Failed to copy text: ', err);
            });
        });
    });
});
