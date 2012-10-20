var should = chai.should();
var expect = chai.expect;

describe("models.Model", function(){
	var User = fel.models.Model.define("User",{
		age: "number",
		man: "boolean",
		birthday: "date",
		messages: {model: "Message", many: true, key: "user"}
	});
	var User2 = User.inherit("User2", {
		superman: "boolean"
	});
	var Message = fel.models.Model.define("Message",{
		value: "string",
		user: {model: "User"} //relation
	});
	var user, user2, message, get_user;
	before(function(){
		user = new User({id: "stas", age:24, birthday: new Date(), man: true});
		user.save();
		var one_more_user = new User({id: "ivan", age:26, birthday: new Date(), man: true});
		one_more_user.save();
		user2 = new User({id: "sergo", age:22, birthday: new Date(), man: true, superman: true});
		user2.save();
		message = new Message({id: "my_msg", value: "one more msg", user: user.id});
		message.save();
	});
	describe("get", function(){
		before(function(){
			get_user = User.get("stas");
		});
		it("should return model by id", function(){
			get_user.should.exist;
			get_user.id.should.be.a("string");
		});
		it("should return date field as date", function(){
			get_user.birthday.should.be.a("date");
		});
		it("should return many relation field as collection of models", function(){
			get_user.messages.should.exist;
			get_user.messages.should.have.length(1);
			get_user.messages[0].id.should.equal(message.id);
		});
		it("should return boolean field as boolean", function(){
			get_user.man.should.be.a("boolean");
		});
		it("should return number field as number", function(){
			get_user.age.should.be.a("number");
		});
		it("should support inheritance and return also children obj", function(){
			var inh_user = User.get(user2.id);
			inh_user.should.exist;
			inh_user.id.should.equal(user2.id);
		});
	});
	describe("save", function(){
		var saving_user;
		before(function(){
			saving_user = new User({id: "boris", age: 25});
			saving_user.save();
		});
		it("should save object in db", function(){
			var saving_user = new User({id: "boris", age: 25});
			saving_user.save();
			var getted_u = User.get(saving_user.id);
			getted_u.should.exist;
			getted_u.id.should.equal(saving_user.id);
		});
	});
	describe("find", function(){
		it("should find objects by filter function, also with inheritance", function(){
			var objs = User.find(function(obj){return obj.age < 25;});
			objs.should.exist;
			objs.should.be.a("array");
			objs.should.have.length(2);
		});
		it("should find objects by example", function(){
			var objs = User.find({age: 26});
			objs.should.exist;
			objs.should.be.a("array");
			objs.should.have.length(1);
			objs = User.find({man: false});
			objs.should.have.length(0);
		});
	});
	describe("remove", function(){
		beforeEach(function(){
			user = new User({id: "stas"});
			user.save();
		});
		it("should delete model by id", function(){
			User.get(user.id).should.exist;
			User.remove(user.id);
			var removed_user = User.get(user.id);
			expect(removed_user).not.exist;
		});
		it("should delete all models", function(){
			User.remove_all();
			var users = User.all();
			users.should.have.length(0);
		});
	});
	after(function(){
		User.remove_all();
		Message.remove_all();
	});
});