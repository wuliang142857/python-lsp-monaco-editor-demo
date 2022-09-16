# monaco-editor-for-python: 针对Python的monaco-editor DEMO

## 特性

 - 集成[Language Server Protocol](https://microsoft.github.io/language-server-protocol/)

## 使用

先安装Python Language Server：

````bash
pip install 'python-language-server[all]' --trusted-host https://repo.huaweicloud.com -i https://repo.huaweicloud.com/repository/pypi/simple
````

编译和运行：

````bash
yarn run build:client
yarn run build:server
yarn run start
````

然后访问: [http://localhost:3000/](http://localhost:3000/)

效果：
![](https://cdn.staticaly.com/gh/wuliang142857/pictures-hosting@main/20220916/20220916_211831.ms7z3u43t00.gif)
