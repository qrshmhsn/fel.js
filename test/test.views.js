var should = chai.should();
var expect = chai.expect;

describe("views.View", function(){
	var viewer = new fel.views.Viewer();
	viewer.add_template("test1", "hello, {{name}}");
	describe("toString", function(){
		it("should return rendered string", function(){
			var v = new fel.views.View("test1", {name: "stas"});
			var res = v.toString();
			res.should.exist;
			res.should.equal("hello, stas");
		});
	});
});