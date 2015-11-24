Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  // counter starts at 0
  // Session.setDefault('counter', 0);

  Template.body.helpers({
    tasks: function () {
      return Tasks.find({},{sort: {createdAt: -1}});
    }
  });

  Template.body.events({
    "submit .new-task": function (event) {
      event.preventDefault();

      var text = event.target.text.value;

      Tasks.insert({
        text : text,
        createdAt : new Date()
      });

      event.target.text.value = "";
    }
  });
  
  Template.task.events({
    "click .toggle-checked" : function(){
      Tasks.update(this._id, {
        $set: {checked: ! this.checked}
      });
    },
    "click .delete" : function () {
      Tasks.remove({_id: this._id});
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
