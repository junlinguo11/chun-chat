<template>
    <tab-container>
        <v-list class="friend-list" two-line>
        <v-subheader class="grey--text text--lighten-4">Search Friends</v-subheader>
        <v-flex class="search-box-div" xs12>
            <input class="search-box grey--text text--lighten-4" type="text" placeholder="搜索朋友" v-model="keyword" @input="searchFriend">
        </v-flex>
          <template v-for="(result, index) in results">
            <v-list-tile avatar :key="result.username">
              <v-list-tile-avatar>
                <img v-bind:src="result.avatar">
              </v-list-tile-avatar>
              <v-list-tile-content class="grey--text text--lighten-4">
                <v-list-tile-title>{{result.username}}</v-list-tile-title>
                <v-list-tile-sub-title>{{result.status}}</v-list-tile-sub-title>
              </v-list-tile-content>
                <v-btn
                    small
                    round
                    disabled
                    v-if="isSelf(result._id)"
                >
                你
                </v-btn>                  
                <v-btn
                    small
                    round
                    disabled
                    v-else-if="isFriend(result._id)"
                >
                好友
                </v-btn>
                <v-btn
                    small
                    round
                    disabled
                    v-else-if="hasSentRequest(result._id)"
                >
                已发送请求
                </v-btn>                
                <v-btn
                    small
                    round
                    ripple
                    flat
                    v-else
                    :loading="isLoading(result._id, loading)" 
                    class="green lighten-2 white--text uploadBtn"
                    @click="addFriend(result._id)"
                >
                <v-icon dark>person_add</v-icon>
                </v-btn>
            </v-list-tile>
            <v-divider v-if="index != (results.length-1)" inset :key="result.username"></v-divider>
          </template>
        </v-list>
    </tab-container>
</template>
<script>
    import debounce from 'debounce';
    import { mapState, mapGetters } from 'vuex'
    import { searchFriend } from '@/api/user';
    import TabContainer from './TabContainer';

    export default {
        name: 'friendlist',
        components: {
            TabContainer,
        },
        data() {
            return {
                loading: null,
                selectedUserId: '',
                results: [],
                keyword: '',
                sentRequest: []
            }
        },
        computed: {
            ...mapState('user', ['user']),
            ...mapGetters('user', {friends: 'friendsList'})
        },
        methods: {
            isFriend: function(id) {
                let isFriend = false;
                for(var i = 0; i < this.friends.length; i++) {
                    if(id === this.friends[i]._id) {
                        isFriend = true;
                    }
                }
                return isFriend;
            },
            isSelf: function(id) {
                let isSelf = false;
                if(this.user._id === id) {
                    isSelf = true;
                }
                return isSelf;
            },
            isLoading: function(id, start) {
                if(this.selectedUserId === id) {
                    return start;
                }
            },
            searchFriend: debounce(function() {
                if(this.keyword) {
                    searchFriend(this.keyword)
                        .then((data) => {
                            this.results = data.results;
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                } else {
                    this.results = [];
                }
            }, 200),              
            addFriend: function(id) {
                this.loading = true;
                this.selectedUserId = id;
                this.$socket.emit('friendRequest', {uid: this.user._id, fid: id});                
            },
            hasSentRequest: function(id) {
                let hasSentRequest = false;
                if(this.sentRequest.indexOf(id) !== -1) {
                    hasSentRequest = true;
                }
                return hasSentRequest;
            }
        },
        sockets: {
            sentFriendRequest: function(fid) {
                this.loading = false;
                this.sentRequest.push(fid);
            }
        }
    }    
</script>
<style scoped>
.friend-list {
    height: 100%;
    background-color: #363e47;
    overflow-y: auto;
}

.list__tile__sub-title {
    color: #98a9b9 !important;
}

.search-box-div {
    padding: 0 8px;
}

.search-box {
    width: 100%;
    border: 1.5px solid #ccc;
    padding:5px 5px 5px 30px;
    outline: none;
    border-radius: 10px;
    background-image:url('../assets/magnify.png');
    background-position: 5px 5px; 
}

.application--light .btn.btn--disabled:not(.btn--icon):not(.btn--flat) {
    background-color: #303841 !important;
    color: white !important;
}

.v-btn.v-btn--disabled >>> .v-btn__content {
    color: rgba(255, 255, 255, 0.4);
}

::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); 
}

::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: rgb(86, 91, 97);
    -webkit-box-shadow: inset 0 0 1px rgba(255,255,255,0.6); 
}
</style>

