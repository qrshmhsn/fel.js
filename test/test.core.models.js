var should = chai.should();

describe("core.models.Model", function(){
	var User = fel.models.Model.define("User",{
		age: "number",
		man: "boolean",
		birthday: "date",
		messages: {model: "Message", many: true, key: "user"}
	});
	var user;
	beforeEach(function(){
		user = new User({id: "stas", age:24, birthday: new Date(), man: true});
		user.save();
	});
	describe("get", function(){
		it("should return model by id", function(){
			var u = User.get(user.id);
			u.should.exist;
			u.id.should.be.a("string");
		});
	});
	afterEach(function(){
		User.remove_all();
	});
});