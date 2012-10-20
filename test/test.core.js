var should = chai.should();
var expect = chai.expect;

describe("core.Object", function(){
	var Animal = fel.core.Object.extend({
		__init__: function(name){
			this.name = name;
		},
		say: function(){
			return "hi";
		}
	});
	var Cat = Animal.extend({
		say: function(){
			return this.baseclass.say()+",myau";
		}
	});
	var Man = Animal.extend({
		__init__: function(name, age){
			this.age = age;
		}
	});
	var animal, cat, man;
	before(function(){
		cat = new Cat("murka");
		man = new Man("stas", 24);
	});
	describe("init", function(){
		it("should accept constructor params in init", function(){
			cat.should.exist;
			cat.name.should.equal("murka");
		});
	});
	describe("extend", function(){
		it("should can call base class method", function(){
			cat.say().should.equal("hi,myau");
		});
		it("should call base constructor by default", function(){
			man.name.should.exist;
			man.name.should.equal("stas");
		});
	});
	describe("merge", function(){
		it("should merge to objects", function(){
			var options = {
				views: {
					templates: {},
					translations: {},
					lang: "ru"
				}
			};
			var options2 = {
				views: {
					templates: {one: "lakdfj"},
					translations: {ru: "lala"}
				}
			};
			var new_options = fel.core.Object.merge(options, options2);
			new_options.views.templates.one.should.equal(options2.views.templates.one);
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