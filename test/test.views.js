var expect = chai.expect;

describe("views.View", function(){
	var viewer = new fel.views.Viewer();
	viewer.add_template("test1", "hello, {{name}}");
	var view1 = new fel.views.View("test1", {name: "stas"});
	var view1_res = "hello, stas";
	viewer.add_template("test2", "hi, {{name}}!");
	var view2 = new fel.views.View("test2", {name: "stas"});
	var view2_res = "hi, stas!";
	describe("toString", function(){
		it("should return rendered string", function(){
			var res = view1.toString();
			expect(res).to.equal(view1_res);
		});
	});
	describe("render", function(){
		it("should be in doc body", function(){
			view1.render("#views");
			expect($("#views").text()).to.equal(view1_res);
			$("#views").empty();
		});
	});
	describe("append", function(){
		it("should be in doc", function(){
			view1.append("#views");
			expect($("#views").text()).to.equal(view1_res);
			$("#views").empty();
		});
		it("should append to existing content", function(){
			view1.append("#views");
			view2.append("#views");
			expect($("#views").text()).to.equal(view1_res+view2_res);
			$("#views").empty();
		});
	});
});