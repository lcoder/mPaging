## 基于jquery的分页插件mPaging

deme:
![mPaging分页插件 demo](http://oco9w3mgp.bkt.clouddn.com/blog_images/mPaging_demo.png)

使用方法：
```javascript
var pager = new kitpage({
        container: $("#mPaging") ,          // 分页代码的容器
        serverKey: "total",                 // 根据服务器端返回的总记录数，计算总页数
        defaultLoading: true ,              // 是否现实默认的loading动画
        ajaxSetting: {                      // jquery的ajax参数，同ajax的配置
            type: "get" ,
            url:  "/api/test" ,
            data: { limit: 10 , offset: 0 }
        }
    });
    pager.on("data",function( data ){       // 每页返回数据，都会调用次方法
        console.log( data ) ;
    }).on("error",function(){               // ajax错误返回的地方
        console.log( arguments );
    }).init();                              // 重要：必需初始化，才会发送ajax请求
```
> test目录为测试目录，里面有个server的文件夹,为一个小型的express服务器，用于测试此插件，已配置好静态资源的路径css,js。git clone下来，需要进入server目录，执行:`npm install`，然后执行:`PORT=3000 npm start`，浏览器访问:`http://127.0.0.1:3000/`即可测试。修改相应的代码:test/test.html , css/ui-default.css , index.js即可查看效果