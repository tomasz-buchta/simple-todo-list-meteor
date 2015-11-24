Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  // counter starts at 0
  // Session.setDefault('counter', 0);

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
    }
  });
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
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
  }
});
