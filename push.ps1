# push.ps1
param(
    # 定义一个参数 'm'，用于接收 commit message，默认值为 "Update site content"
    [string]$m = "Update site content"
)

# 打印提示信息
Write-Host "Step 1: Adding all changes to Git..."
# 执行 git add
git add .

# 打印提交信息
Write-Host "Step 2: Committing changes with message: '$m'"
# 执行 git commit
git commit -m "$m"

# 打印推送信息
Write-Host "Step 3: Pushing changes to GitHub..."
# 执行 git push
git push

Write-Host "✨ All done! Your site is now deploying."
