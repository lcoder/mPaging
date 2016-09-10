/**
 * Created by maotingfeng on 16/7/27.
 */
(function( factory ){
    var md = typeof define == "function" ;
    if( typeof module === 'object' && typeof module.exports === 'object' ){
        module.exports = factory() ;
    }else if( md && define.amd ){
        define( ['require','jquery'] , factory ) ;
    }else if( md && define.cmd ) {
        define( 'ymdate' , ['jquery'] , factory ) ;
    }else{
        window.kitpage = factory( function(){ return window.jQuery } ) ;
    }
})( function( require ){
    var $ = require( 'jquery' ) ;
    function kitpage(){
        this._init.call( this , arguments[0] );
    };
    $.extend( kitpage.prototype , {
        queue: null ,
        on: function(evt,func){
            if(this.queue == null){
                this.queue = {};
            }
            if(!$.isArray(this.queue[evt])){
                this.queue[evt] = [];
            }
            this.queue[evt].push(func);
            return this ;
        } ,
        fire: function(evt,args){
            var self = this;

            if(this.queue == null)return false;
            if(!$.isArray(this.queue[evt]))return false;
            $.each(this.queue[evt],function(index,func){
                if( $.isArray( args ) ) {
                    $.isFunction(func) && func.apply(self,args);
                }else{
                    $.isFunction(func) && func.call(self,args);
                }
            });
            return true;
        } ,
        init: function(){
            var that = this ;
            this._postRequest() ;                               // 初始化时，发送默认请求,根据配置的参数，请求第几页

            if( this.config.history && history.pushState ){     // 初始化时，判断是否需要历史记录
                $(window).on("popstate",function(ev){
                    that.fire("popstate", ev );
                });
            }
        } ,
        _init: function( config ){
            var isSupportAnimate = (function( style ) {                        // 判断是否支持animation动画
                var prefix = ['webkit', 'Moz', 'ms', 'o'],
                    i,
                    humpString = [],
                    htmlStyle = document.documentElement.style,
                    _toHumb = function (string) {
                        return string.replace(/-(\w)/g, function ($0, $1) {
                            return $1.toUpperCase();
                        });
                    };
                for (i in prefix)
                    humpString.push(_toHumb(prefix[i] + '-' + style));
                humpString.push(_toHumb(style));
                for (i in humpString)
                    if (humpString[i] in htmlStyle) return true;
                return false ;
            })('animation') ;
            var base = { serverKey: "count" , history: false , ajaxSetting: { data: { pageSize: 10 , curPage: 1 } } } ;
            // 是否显示默认动画
            config.defaultLoading = isSupportAnimate && ( config.defaultLoading === true ) ;    // 1设备是否支持，2是否参数配置过
            // 默认参数
            this.config = $.extend( true , base , config ) ;
            this.config.ajaxSetting.data.pageSize = this.config.ajaxSetting.data.limit ;
            // 绑定事件
            this._bindEvent() ;
        } ,
        _postRequest: function( args ){
            if( this._promise && this._promise.state() == "pending" ){ return false; }
            var that = this ,
                config = that.config ;
            var ajaxSetting = {
                type: "post" ,
                url: null ,
                data: null ,
                dataType: "json" ,
                beforeSend: function(){
                    that.fire("beforeSend" , args ) ;
                    if( config.defaultLoading === true ){
                        if( args ){
                            config.container.find(".next_page").append('<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>');
                        }else {     // args为undefined，说明第一次请求
                            config.container.find(".spinner").remove().end().append('<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>');
                        }
                    }
                } ,
                complete: function(){
                    if( config.defaultLoading === true ){
                        config.container.find(".spinner").remove() ;
                    }
                    that.fire("complete" , args ) ;
                } ,
                success: function( data ){
                    that.fire("data",data);
                    that._render( data , args );
                } ,
                error: function(){
                    that.fire("error", $.makeArray( arguments ) );
                }
            } ;
            $.extend( true , ajaxSetting , $.extend( true , config.ajaxSetting , { data: args } ) ) ;
            this._promise = $.ajax( ajaxSetting );
        } ,
        _bindEvent: function(){
            var that = this ;
            this.config.container.off().on("click","a",function(){
                var $this = $( this ) ,
                    page = $.trim( $this.data("page") ),
                    curPage = that.config.ajaxSetting.data.curPage ;
                if( page == curPage ){
                    return false;
                } ;
                //that._postRequest( { curPage: page } );
                that._postRequest( { curPage: page , offset: ( Number( page ) - 1 ) * that.config.ajaxSetting.data.limit } );  // 根据hrjia的需求，offset和curpage目的相同，offset从0开始，curpage从1开始
            });
        } ,
        _render: function( data , args ){
            var that = this ,
                config = that.config ,
                pageSize = Number( config.ajaxSetting.data.pageSize ) ,
                curPage = Number( config.ajaxSetting.data.curPage ) ,
                count = data[ config.serverKey ] ;               /*! 服务器返回总的记录数目 */
            var pageCount = Math.ceil( count / pageSize );
            this._parsePagesHtml( curPage , pageCount ) ;

        } ,
        _parsePagesHtml: function( curPage , pageCount ){
            var html = '' ,
                hideOnePage = this.config.hideOnePage ,
                html_onepage = '<a class="prev_page" data-page="1" href="javascript:void(0);">上一页</a><a class="now" data-page="1" href="javascript:void(0);">1</a><a class="next_page" data-page="1" href="javascript:void(0);">下一页</a>';
            $container = this.config.container ;
            if ( pageCount <= 1 ) {    // 没有数据或页数少于2页不显示分页栏
                if( pageCount == 1 ){
                    hideOnePage ? $container.html( "" ) : $container.html( html_onepage ) ;
                }else{
                    $container.html( "" ) ;
                }
                return html;
            }
            var beginPage = ( curPage - 5 ) <= 0 ? 1 : ( curPage - 4 ) ,
                endPage = ( pageCount - curPage ) >= 5 ? ( curPage + 4 ) : pageCount ;

            html += '<a class="prev_page" data-page="'+ ( curPage == 1 ? 1 : curPage - 1 ) +'" href="javascript:void(0);">上一页</a>';
            for (var i = beginPage; i <= endPage; i++) {
                var className = i == curPage ? "now" : "";
                html += '<a class="'+ className +'" data-page="'+ i +'" href="javascript:void(0);">'+ i +'</a>';
            }
            html += '<a class="next_page" data-page="'+ ( endPage == curPage ? endPage : curPage + 1 ) +'" href="javascript:void(0);">下一页</a>';

            $container.html( html ) ;

            return html;
        }
    } );
    return kitpage ;
} ) ;