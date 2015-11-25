Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  Meteor.subscribe("tasks");

  Template.body.helpers({
    tasks: function () {
      if(Session.get("hideCompleted")) {
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        return Tasks.find({},{sort:{createdAt:-1}});
      }
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    incompleteCount: function(){
      return Tasks.find({checked: {$ne:true}}).count();
    }
  });

  Template.body.events({
    "submit .new-task": function (event) {
      event.preventDefault();

      var text = event.target.text.value;
      Meteor.call("addTask",text);

      event.target.text.value = "";
    },
    "change .hide-completed input" : function(event) {
      Session.set("hideCompleted",event.target.checked);
    }
  });

  Template.task.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
      Meteor.call("deleteTask", this._id);
    },
    "click .toggle-private": function() {
      Meteor.call("setPrivate", this._id, ! this.private, function(error, result){
        if(error){
          console.log("error", error);
        }
        if(result){

        }
      });
    }
  });
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
  Template.task.helpers({
    isOwner: function(){
      return this.owner === Meteor.userId();
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
  Meteor.publish("tasks", function(){
    return Tasks.find();
  });
}

Meteor.methods({
  addTask:function(text){
    if(! Meteor.userId()) {
      throw new Meteor.Error(403,"not-authorized");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    if(! Meteor.userId()) {
      throw new Meteor.Error(403,"not-authorized");
    }
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    if(! Meteor.userId()) {
      throw new Meteor.Error(403,"not-authorized");
    }
    Tasks.update(taskId, { $set: { checked: setChecked} });
  },
  setPrivate: function(taskId,setToPrivate){
    var task = Tasks.findOne({_id: taskId});

    if (task.owner !== Meteor.userId()){
      throw new Meteor.Error(403, "not-authorized");
    }
    Tasks.update({_id: taskId}, {$set:{
      private: setToPrivate
    }});

  }
});
