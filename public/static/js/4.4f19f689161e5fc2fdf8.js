webpackJsonp([4],{"/RHr":function(t,a,e){"use strict";a.a={name:"companyawards",data:function(){return{awardArray:[],totalAwardArray:[],noAwards:!1,isGeneral:!0,showGeneral:!0,showYours:!1,posts:[{id:0,photoURL:"https://goo.gl/KnVxVY",name:"Harishankar",text:"registered for your contest SpriteXtreme",action:"upvoted"},{id:1,photoURL:"https://goo.gl/1nKusR",name:"Balaji D Loganathan",text:"was given an award by a company",action:"commented"},{id:2,photoURL:"https://goo.gl/Ckaexc",name:"Surendran S",text:"has the most upvoted project which you upvoted",action:"upvoted"}]}},methods:{viewAward:function(t){this.$router.push("/student/award/"+t)}},created:function(){var t=this,a=this.$ls.get("email"),e=this.$ls.get("token"),s={headers:{Authorization:"Bearer "+e}};this.$http.get("/students/get?email="+a,s).then(function(a){console.log("student Data",a.data);var e=a.data[0].awards;0===e.length&&(t.noAwards=!0),e.map(function(a){t.$http.get("/awards/get?id="+a,s).then(function(a){t.awardArray.push(a.data),console.log("award array",t.awardArray)}).catch(function(t){console.log("awarderr",t)})})}).catch(function(t){console.log("student err",t)}),this.$http.get("/awards/all",s).then(function(a){t.totalAwardArray=a.data.awards}).catch(function(t){console.log("awarderr",t)})},updated:function(){this.isGeneral?(this.showYours=!1,this.showGeneral=!0):(this.showYours=!0,this.showGeneral=!1)}}},"0nc3":function(t,a,e){a=t.exports=e("FZ+f")(!0),a.push([t.i,".createproject-div[data-v-117c05da]{text-align:center}.newsfeed-page[data-v-117c05da]{padding-left:0!important}.projects-time[data-v-117c05da]{margin-top:3px;color:#a29e9e}#projects-name-div[data-v-117c05da]{display:inline-block}#projects-content-div[data-v-117c05da]{margin-top:.5rem}.gotnew[data-v-117c05da]{margin-bottom:1.5rem}.noContests[data-v-117c05da]{text-align:center;font-weight:700;margin-top:7rem}#tagDiv[data-v-117c05da]{display:inline-block;margin-top:1rem}.tagNames[data-v-117c05da]{padding:.2rem .5rem;margin-left:.5rem;background:#759fbc;color:#fff;border-radius:5%}.switch[data-v-117c05da]{margin-bottom:1rem}","",{version:3,sources:["/home/hs/Spritle/student-burger/webapp/src/components/awards/Index.vue"],names:[],mappings:"AACA,oCACE,iBAAmB,CACpB,AACD,gCACE,wBAA8B,CAC/B,AACD,gCACE,eAAgB,AAChB,aAAe,CAChB,AACD,oCACE,oBAAsB,CACvB,AACD,uCACE,gBAAmB,CACpB,AACD,yBACE,oBAAsB,CACvB,AACD,6BACE,kBAAmB,AACnB,gBAAkB,AAClB,eAAiB,CAClB,AACD,yBACE,qBAAsB,AACtB,eAAiB,CAClB,AACD,2BACE,oBAAuB,AACvB,kBAAoB,AACpB,mBAAoB,AACpB,WAAa,AACb,gBAAkB,CACnB,AACD,yBACE,kBAAoB,CACrB",file:"Index.vue",sourcesContent:["\n.createproject-div[data-v-117c05da] {\n  text-align: center;\n}\n.newsfeed-page[data-v-117c05da] {\n  padding-left: 0rem !important;\n}\n.projects-time[data-v-117c05da] {\n  margin-top: 3px;\n  color: #a29e9e;\n}\n#projects-name-div[data-v-117c05da] {\n  display: inline-block;\n}\n#projects-content-div[data-v-117c05da] {\n  margin-top: 0.5rem;\n}\n.gotnew[data-v-117c05da] {\n  margin-bottom: 1.5rem;\n}\n.noContests[data-v-117c05da] {\n  text-align: center;\n  font-weight: bold;\n  margin-top: 7rem;\n}\n#tagDiv[data-v-117c05da] {\n  display: inline-block;\n  margin-top: 1rem;\n}\n.tagNames[data-v-117c05da] {\n  padding: 0.2rem 0.5rem;\n  margin-left: 0.5rem;\n  background: #759FBC;\n  color: white;\n  border-radius: 5%;\n}\n.switch[data-v-117c05da] {\n  margin-bottom: 1rem;\n}\n"],sourceRoot:""}])},V6rw:function(t,a,e){"use strict";function s(t){e("ZR+H")}Object.defineProperty(a,"__esModule",{value:!0});var n=e("/RHr"),r=e("phgk"),i=e("VU/8"),o=s,d=i(n.a,r.a,!1,o,"data-v-117c05da",null);a.default=d.exports},"ZR+H":function(t,a,e){var s=e("0nc3");"string"==typeof s&&(s=[[t.i,s,""]]),s.locals&&(t.exports=s.locals);e("rjj0")("a4c7bd12",s,!0)},phgk:function(t,a,e){"use strict";var s=function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("div",[e("vuestic-switch",{staticClass:"col-md-4 switch",model:{value:t.isGeneral,callback:function(a){t.isGeneral=a},expression:"isGeneral"}},[e("span",{attrs:{slot:"trueTitle"},slot:"trueTitle"},[t._v("All awards")]),t._v(" "),e("span",{attrs:{slot:"falseTitle"},slot:"falseTitle"},[t._v("Your awards")])]),t._v(" "),e("div",{directives:[{name:"show",rawName:"v-show",value:t.showYours,expression:"showYours"}],staticClass:"row"},[e("div",{staticClass:"col-md-8"},[e("div",{directives:[{name:"show",rawName:"v-show",value:t.noAwards,expression:"noAwards"}],staticClass:"noContests"},[e("h4",[t._v("Make yourself more harder and get awards")])]),t._v(" "),t._l(t.awardArray,function(a){return e("vuestic-widget",{key:a.id},[e("div",[e("div",{attrs:{id:"projects-name-div"}},[e("span",{staticClass:"projects-name"},[e("strong",[e("a",{attrs:{href:""},on:{click:function(e){t.viewAward(a._id)}}},[t._v(t._s(a.title))])])]),e("br"),t._v(" "),e("span",{staticClass:"projects-time"},[e("timeago",{attrs:{since:a.createdAt,"auto-update":60}})],1)])]),t._v(" "),e("div",{attrs:{id:"projects-content-div"}},[e("span",{attrs:{id:"projects-description"}},[t._v(t._s(a.description))])]),t._v(" "),e("div",{attrs:{id:"tagDiv"}},[e("strong",[t._v("Tags:")]),t._l(a.tags,function(a){return e("span",{key:a.id,staticClass:"tagNames"},[t._v(t._s(a.name))])})],2)])})],2),t._v(" "),e("div",{staticClass:"col-md-4"},[e("vuestic-widget",{staticClass:"createproject-div"},[e("div",{staticClass:"col-md-offset-6 col-md-12"},[e("h5",{staticClass:"gotnew"},[t._v("Want more Awards?")]),t._v(" "),e("h6",[t._v("Read more about our tips..")])])]),t._v(" "),e("vuestic-widget",{staticClass:"live-feed",attrs:{headerText:"Live feeds"}},[e("vuestic-feed",{staticClass:"newsfeed-page",attrs:{initialPosts:t.posts}})],1)],1)]),t._v(" "),e("div",{directives:[{name:"show",rawName:"v-show",value:t.showGeneral,expression:"showGeneral"}],staticClass:"row"},[e("div",{staticClass:"col-md-8"},t._l(t.totalAwardArray,function(a){return e("vuestic-widget",{key:a.id},[e("div",[e("div",{attrs:{id:"projects-name-div"}},[e("span",{staticClass:"projects-name"},[e("strong",[e("a",{attrs:{href:""},on:{click:function(e){e.preventDefault(),t.viewAward(a._id)}}},[t._v(t._s(a.title))])])]),e("br"),t._v(" "),e("span",{staticClass:"projects-time"},[e("timeago",{attrs:{since:a.createdAt,"auto-update":60}})],1)])]),t._v(" "),e("div",{attrs:{id:"projects-content-div"}},[e("span",{attrs:{id:"projects-description"}},[t._v(t._s(a.description))])]),t._v(" "),e("div",{attrs:{id:"tagDiv"}},[e("strong",[t._v("Tags:")]),t._l(a.tags,function(a){return e("span",{key:a.id,staticClass:"tagNames"},[t._v(t._s(a.name))])})],2)])})),t._v(" "),e("div",{staticClass:"col-md-4"},[e("vuestic-widget",{staticClass:"createproject-div"},[e("div",{staticClass:"col-md-offset-6 col-md-12"},[e("h5",{staticClass:"gotnew"},[t._v("Want more Awards?")]),t._v(" "),e("h6",[t._v("Read more about our tips..")])])]),t._v(" "),e("vuestic-widget",{staticClass:"live-feed",attrs:{headerText:"Live feeds"}},[e("vuestic-feed",{staticClass:"newsfeed-page",attrs:{initialPosts:t.posts}})],1)],1)])],1)},n=[],r={render:s,staticRenderFns:n};a.a=r}});
//# sourceMappingURL=4.4f19f689161e5fc2fdf8.js.map