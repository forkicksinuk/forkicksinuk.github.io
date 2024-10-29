source "https://rubygems.org"

gem "jekyll", "~> 4.3.0"

# 必要的插件
group :jekyll_plugins do
  gem "jekyll-paginate"
  gem "jekyll-sitemap"
  gem "jekyll-seo-tag"
  gem "jekyll-feed"
end

# Windows 平台特定依赖
platforms :mingw, :x64_mingw, :mswin do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
  gem "wdm", "~> 0.1.1"
end

# 锁定 webrick 版本，解决 Ruby 3.0+ 兼容性问题
gem "webrick", "~> 1.7"
