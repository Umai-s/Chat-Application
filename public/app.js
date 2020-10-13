var currentUserKey = '';
var chatKey = '';

function startChat(friendKey, friendName, friendPhoto) {

    var friendList = {
        friendId: friendKey,
        userId: currentUserKey
    };

    // friend_id = friendKey;

    var db = firebase.database().ref('friend_list');
    var flag = false;
    db.on('value', function (friends) {
        friends.forEach(function (data) {
            var user = data.val();
            if ((user.friendId === friendList.friendId && user.userId === friendList.userId) || ((user.friendId === friendList.userId && user.userId === friendList.friendId))) {
                flag = true;
                chatKey = data.key;
            }
        });

        if (flag === false) {
            chatKey = firebase.database().ref('friend_list').push(friendList, function (error) {
                if (error) alert(error);
                else {
                    document.getElementById('chatPanel').removeAttribute('style')
                    document.getElementById('startDiv').setAttribute('style', 'display:none')
                    hideChats()
                }
            }).getKey();
        }
        else {
            document.getElementById('chatPanel').removeAttribute('style')
            document.getElementById('startDiv').setAttribute('style', 'display:none')
            hideChats()
        }

        //display friend name and photo
        document.getElementById('divChatName').innerHTML = friendName;
        document.getElementById('imgChat').src = friendPhoto;

        document.getElementById('messages').innerHTML = '';

        document.getElementById('textbox').value = '';
        document.getElementById('textbox').focus();

        // Display The chat messages
        LoadChatMessages(chatKey, friendPhoto);
    });
}

function LoadChatMessages(chatKey, friendPhoto) {
    var db = firebase.database().ref('chatMessages').child(chatKey);
    db.on('value', function (chats) {
        var messageDisplay = '';
        chats.forEach(function (data) {
            var chat = data.val();
            var dateTime = chat.dateTime.split(",");

            if (chat.userId !== currentUserKey) {
                messageDisplay += `<div class="row">
                                    <div class="col-2 col-sm-1 col-md-1">
                                        <img src="${friendPhoto}" class="chat-pic rounded-circle" />
                                    </div>
                                    <div class="col-6 col-sm-7 col-md-7">
                                        <p class="receive-msg">
                                            ${chat.msg}
                                            <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span>
                                        </p>
                                    </div>
                                </div>`;
            }
            else {
                messageDisplay += `<div class="row justify-content-end">
                            <div class="col-6 col-sm-7 col-md-7">
                                <p class="send-msg float-right">
                                    ${chat.msg}
                                    <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span>
                                </p>
                            </div>
                            <div class="col-2 col-sm-1 col-md-1">
                                <img src="${firebase.auth().currentUser.photoURL}" class="chat-pic rounded-circle" />
                            </div>
                        </div>`;
            }
        });

        document.getElementById('messages').innerHTML = messageDisplay;
        document.getElementById('messages').scrollTo(0, document.getElementById('messages').scrollHeight);
    });
}


function showChats() {
    document.getElementById('box1').classList.remove('d-none', 'd-md-block');
    document.getElementById('box2').classList.add('d-none');
}

function hideChats() {
    document.getElementById('box1').classList.add('d-none', 'd-md-block');
    document.getElementById('box2').classList.remove('d-none');
}

function OnKeyDown(event) {
    var k = event.keyCode;
    if (k === 13) {
        sendMsg();
    }
}

function sendMsg() {
    var chatmsg = {
        userId: currentUserKey,
        msg: document.getElementById('textbox').value,
        dateTime: new Date().toLocaleString()
    }

    firebase.database().ref('chatMessages').child(chatKey).push(chatmsg, function (error) {
        if (error) alert(error);
        else {
        //     var msg = ` <div class="row justify-content-end">
        //     <div class="col-7 col-sm-7 col-md-7">
        //         <p class="send-msg float-right">
        //         ${document.getElementById('textbox').value}
        //             <span class="time float-right">1:20 PM</span>
        //         </p>
        //     </div>
        //     <div class="col-2 col-sm-1 col-md-1">
        //         <img src="${firebase.auth().currentUser.photoURL}" alt="" class="rounded-circle chat-pic">
        //     </div>
        // </div>`;

            // document.getElementById('messages').innerHTML += msg;
            document.getElementById('textbox').value = ''
            document.getElementById('textbox').focus();

            document.getElementById('messages').scrollTo(0, document.getElementById('messages').scrollHeight);

        }
    })
}

function LoadChatList() {
    var db = firebase.database().ref('friend_list');
    db.on('value', function (lists) {
        document.getElementById('lstChat').innerHTML = ` <li class="list-group-item" style="background-color: #f8f8f8 ;">
                                                        <input type="text" placeholder="Search or start new chat" class="form-control search-box">
                                                        </li> `;
        lists.forEach(function (data) {
            var lst = data.val();
            var friendKey = '';
            if (lst.friendId === currentUserKey) {
                friendKey = lst.userId;
            }
            else if (lst.userId === currentUserKey) {
                friendKey = lst.friendId;
            }

            if (friendKey !== "") {
                firebase.database().ref('users').child(friendKey).on('value', function (data) {
                    var user = data.val();
                    document.getElementById('lstChat').innerHTML +=
                        `<li class="list-group-item list-group-item-action" onclick="startChat('${data.key}', '${user.name}', '${user.photoURL}')">
                        <div class="row">
                            <div class="col-md-2">
                                <img src="${user.photoURL}" alt="" class="rounded-circle friend-pic">
                            </div>
                            <div class="col-md-10" style="cursor:pointer">
                                <div class="person-name">${user.name}</div>
                                <div class="person-msg">
                                    This message is sent by Somebody...
                                </div>
                            </div>
                        </div>
                    </li>`;
                });
            }
        });
    });
}


function PopulateFriendList() {
    document.getElementById('lstFriend').innerHTML = `<div class="text-center">
                                                        <span class="spinner-border text-primary mt-5" style="width:7rem;height:7rem"></span>
                                                    </div>`;
    var db = firebase.database().ref('users');
    var lst = '';
    db.on('value', function (users) {
        if (users.hasChildren()) {
            lst = `<li class="list-group-item" style="background-color:#f8f8f8;">
                           <input type="text" placeholder="Search or start new chat" class="form-control search-box" />
                       </li>`
                ;
        }
        users.forEach(function (data) {
            var user = data.val();
            if (user.email !== firebase.auth().currentUser.email) {
                lst += `<li class="list-group-item list-group-item-action" data-dismiss="modal" onclick="startChat('${data.key}', '${user.name}', '${user.photoURL}')">
                           <div class="row">
                               <div class="col-md-2">
                                   <img src="${user.photoURL}" class="rounded-circle friend-pic" />
                               </div>
                               <div class="col-md-10" style="cursor:pointer;">
                                   <div class="person-name">${user.name}</div>
                               </div>
                           </div>
                       </li>`;
            }
        });

        document.getElementById('lstFriend').innerHTML = lst;
    });

}

function signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then(function (result) {
            console.log("user==>", user)
            // window.location = "home.html"
        })
        .catch(function (error) {
            console.log(error.message)
        });
}

function signOut() {
    firebase.auth().signOut();
}

function onFirebaseStateChanged() {
    firebase.auth().onAuthStateChanged(onStateChanged);
}

function onStateChanged(user) {
    if (user) {
        var userProfile = {
            email: '',
            name: '',
            photoURL: ''
        };
        userProfile.email = firebase.auth().currentUser.email;
        userProfile.name = firebase.auth().currentUser.displayName;
        userProfile.photoURL = firebase.auth().currentUser.photoURL;

        var db = firebase.database().ref('users');
        var flag = false;
        db.on('value', function (users) {
            users.forEach(function (data) {
                var user = data.val();
                if (user.email === userProfile.email) {
                    currentUserKey = data.key;
                    flag = true;
                }
            });

            if (flag === false) {
                firebase.database().ref('users').push(userProfile, callback);
            }
            else {
                document.getElementById('img-profile').src = firebase.auth().currentUser.photoURL;
                document.getElementById('img-profile').title = firebase.auth().currentUser.displayName;

                document.getElementById('lnkSignIn').style = 'display:none';
                document.getElementById('lnkSignOut').style = '';
            }

            document.getElementById('lnkNewChat').classList.remove('disabled');

            LoadChatList();
        });
    }
    else {
        document.getElementById('img-profile').src = 'images/icon.png';
        document.getElementById('img-profile').title = '';

        document.getElementById('lnkSignIn').style = '';
        document.getElementById('lnkSignOut').style = 'display:none';

        document.getElementById('lnkNewChat').classList.add('disabled');
    }

}

function callback(error) {
    if (error) {
        console.log(error)
        alert(error);
    }
    else {
        document.getElementById('img-profile').src = firebase.auth().currentUser.photoURL;
        document.getElementById('img-profile').title = firebase.auth().currentUser.displayName;

        document.getElementById('lnkSignIn').style = 'display:none';
        document.getElementById('lnkSignOut').style = '';
    }
}
//calling auth State changed
onFirebaseStateChanged();