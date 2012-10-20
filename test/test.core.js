var should = chai.should();
var expect = chai.expect;

describe("core.Object", function(){
	var Animal = fel.core.Object.extend({
		__init__: function(name){
			this.name = name;
		},
		say: function(){
			return "I'm {0}".f(this.name);
		}
	});
	var Cat = Animal.extend({
		say: function(){
			return "myau";
		}
	});
	var animal, cat;
	before(function(){
		cat = new Cat("murka");
	});
	describe("init", function(){
		it("should accept constructor params in init", function(){
			cat.should.exist;
			cat.name.should.equal("murka");
		});
	});
	describe("extend", function(){
		it("should extend base class", function(){
		});
	});
});
describe("core.SingletonObject", function(){
	var Single = fel.core.SingletonObject.extend({
		__init__: function(val){
			this.val = val;
		}
	});
	it("should exist only one instance of singleton", function(){
		var single = new Single(555);
		var single2 = new Single(77);
		single.should.equal(single2);
		single.val.should.equal(single2.val);
	});
});