var should = chai.should();

describe("core.models.Model", function(){
	var User = fel.models.Model.define("User",{
		age: "number",
		man: "boolean",
		birthday: "date",
		messages: {model: "Message", many: true, key: "user"}
	});
	var Message = fel.models.Model.define("Message",{
		value: "string",
		user: {model: "User"} //relation
	});
	var user, message, get_user;
	before(function(){
		user = new User({id: "stas", age:24, birthday: new Date(), man: true});
		user.save();
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
	});
	after(function(){
		User.remove_all();
	});
});