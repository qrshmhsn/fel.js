var expect = chai.expect;

describe("views.View", function(){
	var viewer = new fel.views.Viewer();
	viewer.add_template("test1", "hello, {{name}}");
	var view1 = new fel.views.View("test1", {name: "stas"});
	var view1_res = "hello, stas";
	describe("toString", function(){
		it("should return rendered string", function(){
			var res = view1.toString();
			expect(res).to.equal(view1_res);
		});
	});
	describe("append", function(){
		it("should be in doc body", function(){
			view1.append("#views");
			expect($("#views").text()).to.equal(view1_res);
			$("#views").empty();
		});
	});
});