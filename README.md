#EventProxy

###自定义事件、观察者模式

EventProxy是js自定义事件、观察者模式的一种实现，目的是为了解耦js逻辑，使代码更易扩展维护。EventProxy支持链式操作。

###使用方法

#####proxy.on(name, fn) 

注册事件

	var proxy = EventProxy();
	proxy.on('test1', function () {
		console.log(1);
	})
	.on('test2', function () {
		console.log(2);
	});
	
#####proxy.trigger(name, arg1[, arg2][, arg3])
 
触发事件

	proxy.trigger('test', '1', '2', '3');	
	
#####proxy.off(name, fn) 

移除事件

	proxy.off('test', function () {
		console.log
	});
	
#####proxy.once(name, fn) 

注册只执行一次事件，该接口注册的事件在trigger触发一次后即会移除
	
	proxy.once('test', function (a, b) {
		console.log(a);
		console.log(b);
	})
	.trigger('test', 1, 2)
	.trigger('test', 3, 4); 

输出结果：

* 1
* 2

#####proxy.many(name, times, fn) 
在trigger times次后，事件将会自动移除

	var counter = 0;
	proxy.many('test', 2, function () {
		counter++;
		console.log(counter);
	})
	.trigger('test')
	.trigger('test')
	.trigger('test');

输出结果：

* 0
* 1

#####proxy.assign(name1[, name2][, name3], fn) 

当所有事件name1, name2, name3 触发完后，执行函数fn

	proxy.assign('test1', 'test2', 'test3', function (arg1, arg2, arg3) {
		console.log(arg1);
		console.log(arg2);
		console.log(arg3);
	});
	
	setTimeout(function () {
		proxy.trigger('test1', 100);
	}, 100);
	proxy.trigger('test3', 700, 800);
	proxy.trigger('test2', 100, 200);

输出结果：

* 100
* [100, 200] //当参数多于1个时，自动转换为数组传递
* [700, 800]



	


