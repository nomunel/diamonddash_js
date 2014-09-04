/**
 * Diamond Dash関連オブジェクトを格納するNamespace
 */
var DIAMONDDASH = DIAMONDDASH || {};
 
/**
 * BlockのModel
 * 
 * BlockModelで初期値を設定
 * BlockCollectionで、Blockのtype（色）を設定
 */
(function(window) {
    var ns = window.DIAMONDDASH || {};

    ns.BlockModel = Backbone.Model.extend({
        defaults: {
            blockColor: 0,		//0:赤、1:黄、2:紫、3:緑、4:青
            blockX: 0,			//ブロックのX座標（0〜6）
            blockY: 0, 			//ブロックのY座標（0〜7）
            id: '0_0',			//ブロックの座標を表すID
            erasable: false,	//消せるかどうか
            group: undefined	//消せるブロックグループ
        }
    });

    ns.BlockCollection = Backbone.Collection.extend({
        model: ns.BlockModel,
        properties: {
            blockListX: 9,   	//列の数
            blockListY: 9,   	//行の数
            delteBlocksCount: 0 //消したブロックの総数
        },
        initialize: function() {
            this.collection = this.setBlockColor();
            this.setErasables(this);
        },
        //ブロックカラーをランダムで設定するメソッド
        setBlockColor: function() {
        	for(var x = 0; x < 7; x ++) {
        		this.models[x] = [];
	        	for(var y = 0; y < 8; y ++) {
	        		id = x + (y * 7);
	        		var r = Math.round(Math.random() * 4);
	        		var blockModel = new ns.BlockModel({id: x +'_'+ y, blockColor: r, blockX: x, blockY: y});
	        		this.models[x][y] = blockModel;
	        	}
        	}
        	return this;
        },
        //ブロックが消えるかどうか判定
        setErasables: function(self) {
        	var group = 0;				//グループID定義
        	var checkFlg = new Array(7);	//チェック済みか管理するフラグ配列定義（7×8）
        	for(var i = 0; i < 7; i++) {
        		checkFlg[i] = new Array(8);
        	}
            for(var y = 0; y < 8; y ++) {
                for(var x = 0; x < 7; x ++) {
                    if(self.models[x][y] != undefined) {
                       self.models[x][y].set('erasable', false);
                       self.models[x][y].set('group', undefined);
                    }
                }
            }
            var firstFlg = 0;
        	for(var y = 0; y < 8; y ++) {
	        	for(var x = 0; x < 7; x ++) {
			        var sameBlockCount = 0;		//繋がっている同じブロックの総数
			        //周りのブロック判定メソッド
                    if(self.models[x][y] != undefined) {
                        (function checkAroundBlock(self,x,y) {
                            //上のブロックと比較
                            if(y > 0 && self.models[x][y - 1] != undefined) {
                                if(self.models[x][y].get('blockColor') == self.models[x][y - 1].get('blockColor')) {
                                    if(self.models[x][y - 1].get('group') == undefined && checkFlg[x][y - 1] == undefined) {
                                        checkFlg[x][y - 1] = 1;
                                        sameBlockCount ++;
                                        if(sameBlockCount >= 3) {
                                            self.models[x][y].set('group',group);
                                            self.models[x][y - 1].set('group',group);
                                        }
                                        checkAroundBlock(self, x, y - 1);
                                    }
                                }
                            }
                            //左のブロックと比較
                            if(x > 0 && self.models[x - 1][y] != undefined) {
                                if(self.models[x][y].get('blockColor') == self.models[x - 1][y].get('blockColor')) {
                                    if(self.models[x - 1][y].get('group') == undefined && checkFlg[x - 1][y] == undefined) {
                                        checkFlg[x - 1][y] = 1;
                                        sameBlockCount ++;
                                        if(sameBlockCount >= 3) {
                                            self.models[x][y].set('group',group);
                                            self.models[x - 1][y].set('group',group);
                                        }
                                        checkAroundBlock(self, x - 1, y);
                                    }
                                }
                            }
                            //右のブロックと比較
                            if(x < 6 && self.models[x + 1][y] != undefined) {
                                if(self.models[x][y].get('blockColor') == self.models[x + 1][y].get('blockColor')) {
                                    if(self.models[x + 1][y].get('group') == undefined && checkFlg[x + 1][y] == undefined) {
                                        checkFlg[x + 1][y] = 1;
                                        sameBlockCount ++;
                                        if(sameBlockCount >= 3) {
                                            self.models[x][y].set('group',group);
                                            self.models[x + 1][y].set('group',group);
                                        }
                                        checkAroundBlock(self, x + 1, y);
                                    }
                                }
                            }
                            //下のブロックと比較
                            if(y < 7 && self.models[x][y + 1] != undefined) {
                                if(self.models[x][y].get('blockColor') == self.models[x][y + 1].get('blockColor')) {
                                    if(self.models[x][y + 1].get('group') == undefined && checkFlg[x][y + 1] == undefined) {
                                        checkFlg[x][y + 1] = 1;
                                        sameBlockCount ++;
                                        if(sameBlockCount >= 3) {
                                            self.models[x][y].set('group',group);
                                            self.models[x][y + 1].set('group',group);
                                        }
                                        checkAroundBlock(self, x, y + 1);
                                    }
                                }
                            }
                            if(sameBlockCount >= 3) {
                                self.models[x][y].set('group', group);
                                self.models[x][y].set('erasable', true);
                            }
                        })(self,x,y);
                    }
			        if(sameBlockCount >= 3) {
			        	group ++;
			        }
		        	// console.log('座標' + x + ' ' + y + ' erasable = ' + self.models[x][y].get('erasable'));
	        	}
        	}
        }
    });
})(this);

/**
 * BlockのView
 * 
 * BlockのDOM生成とイベント設定、表示変更
 */
(function(window) {
    var ns = window.DIAMONDDASH || {};

    ns.BlockView = Backbone.View.extend({
        tagName: 'li',
        className: 'block',
        initialize: function(options) {
            // options.on('change:erasable', this.render);
        },
        events: {
            'click': 'clickHandler',
        },
        clickHandler: function(event) {
            this.trigger('blockClick', event, this);
        },
        render: function(self) {
            // console.log(self);
            // var blockView = new ns.BlockView(self);
            // console.log(blockView);
            // $('#' + self.get('blockX') + '_' + self.get('blockY')).html(blockView.el);
            // return this;
        }
    });
})(this);
 
/**
 * BlockリストのView
 * 
 * Collectionを初期化し、各Blockをレンダリング
 * Blockのclickイベントをハンドリング
 */
(function(window) {
    var ns = window.DIAMONDDASH || {};
 
    ns.BlockListView = Backbone.View.extend({
        initialize: function() {
            this.collection = new ns.BlockCollection();
            this.render();
        },
        render: function() {
        	this.blockListSet();
        },
        //ブロックの初期配置処理
        blockListSet: function() {
        	var lis = [];
        	id = 0;
        	for(var y = 0; y < 8; y ++) {
	        	for(var x = 0; x < 7; x ++) {
	        		lis[id] = new ns.BlockView(this.collection.models[x][y]);
	                lis[id].$el.addClass("type_" + lis[id].attributes.blockColor);

                    //消えるブロックを分かり易くする一時処理（デバッグ用）
                    // if(lis[id].attributes.erasable == true) {
                    //     lis[id].$el.addClass('erasable');
                    // }

	                lis[id].on('blockClick', $.proxy(this.blockGroupDelete, this.collection));
	        		this.$el.append(lis[id].el);
	        		id ++;
	        	}
        	}
        },
        //３つ以上隣接してるブロックグループを消去
        blockGroupDelete: function(event, self) {
        	// console.log('group=' + self.attributes.group);
        	// console.log('消える？' + self.attributes.erasable);
            var deletedBlocks = []; //消したブロックの座標情報
            var i = 0;
        	for(var y = 0; y < 8; y ++) {
	        	for(var x = 0; x < 7; x ++) {
	        		// console.log(this.models[x][y].get('group'));
                    if(this.models[x][y] != undefined) {
                        if(this.models[x][y].get('group') != undefined) {
                            if(this.models[x][y].get('group') == self.attributes.group && this.models[x][y].get('erasable') == true) {
                                $('#' + x + '_' + y).addClass('hidden');
                                deletedBlocks[i] = [];
                                deletedBlocks[i].push(x,y);
                                i++;
                            } 
                        }
                    }
	        	}
        	}
            ns.BlockListView.prototype.blockFall(this, deletedBlocks, self);
        },
        //ブロックの落下処理
        blockFall: function(self, deletedBlocks, view) {
            // console.log(self);
            // console.log(deletedBlocks);
            var x0 = 0, x1 = 0, x2 = 0, x3 = 0, x4 = 0, x5 = 0, x6 = 0;         //各x座標毎の落下数を入れる変数定義
            var y_x0 = [], y_x1 = [], y_x2 = [], y_x3 = [], y_x4 = [], y_x5 = [], y_x6 = []; //消えたブロックのあるx座標の内、最小のy座標の候補を入れる変数
            _.each(deletedBlocks,function(num ,index) {
                switch(num[0]) {
                    case 0:
                        x0 ++;
                        y_x0.push(num[1]);
                        break;
                    case 1:
                        x1 ++;
                        y_x1.push(num[1]);
                        break;
                    case 2:
                        x2 ++;
                        y_x2.push(num[1]);
                        break;
                    case 3:
                        x3 ++;
                        y_x3.push(num[1]);
                        break;
                    case 4:
                        x4 ++;
                        y_x4.push(num[1]);
                        break;
                    case 5:
                        x5 ++;
                        y_x5.push(num[1]);
                        break;
                    case 6:
                        x6 ++;
                        y_x6.push(num[1]);
                        break;
                }
            });
            // for(i = 0; i < 7; i++) {
            //     if(eval('x'+ i) != 0) {
            //         console.log('x' + i + 'の消えたブロック数は' + eval('x'+i));
            //         console.log('x' + i + 'の消えたブロックの内、一番上のもののY座標は' + _.min(eval('y_x' + i)));
            //         console.log('x' + i + 'の消えたブロックの内、一番下のもののY座標は' + _.max(eval('y_x' + i)));
            //     }
            // }

            for(n = 0; n < 7; n ++) {
                if(eval('x'+ n) != 0) {
                    //コの字型にブロックを消した際の処理
                    var fallY_max = _.max(eval('y_x' + n)); //そのX座標上で消えるブロック内で最大のY座標
                    var fallY_now = fallY_max;
                    var fallY_min = _.min(eval('y_x' + n)) - 1; //そのX座標上で消えるブロック内で最小のY座標-1
                    var fallCount = 0;  //そのX軸上で落としたブロックの数
                    while(fallY_now > fallY_min) {
                        if(self.models[n][fallY_now] != undefined) {
                            if(self.models[n][fallY_now].get('group') != view.attributes.group) {
                                var tempY = $('#'+n+'_'+fallY_now).css('top');  //元のY位置を取得
                                tempY = Number(tempY.slice(0, -2));
                                $('#'+n+'_'+fallY_now).css('top', tempY + (39 * (fallY_max - fallY_now - fallCount)));
                                $('#'+n+'_'+fallY_now).attr('id', n + '_' + (fallY_max - fallCount)); //IDを更新
                                var tempY = self.models[n][fallY_now].get('blockY')
                                self.models[n][fallY_now].set('blockY', (fallY_max - fallCount));     //modelのY座標を更新
                                self.models[n][fallY_now].set('id', n + '_' + (fallY_max - fallCount));     //modelのIDを更新
                                self.models[n][(fallY_max - fallCount)] = self.models[n][fallY_now];  //落下先のブロックのmodelを上書き
                                delete self.models[n][fallY_now];   //落下元のブロックのmodelを削除
                                fallCount ++;
                            }
                        }
                        fallY_now --;
                    }
                    while(fallY_min >= 0) {
                        //そのX座標のブロックの内、消えたブロックの最小のYより上にあるブロックに対する落下処理
                        if(self.models[n][fallY_min] != undefined) {
                            var tempY = $('#'+n+'_'+fallY_min).css('top');  //元のY位置を取得
                            tempY = Number(tempY.slice(0, -2));
                            $('#'+n+'_'+fallY_min).css('top', tempY + (39 * eval('x'+n)));
                            $('#'+n+'_'+fallY_min).attr('id', n + '_' + (fallY_min + eval('x'+n))); //IDを更新
                            var tempY = self.models[n][fallY_min].get('blockY')
                            self.models[n][fallY_min].set('blockY', (fallY_min + eval('x'+n)));     //modelのY座標を更新
                            self.models[n][fallY_min].set('id', n + '_' + (fallY_min + eval('x'+n)));     //modelのIDを更新
                            self.models[n][(fallY_min + eval('x'+n))] = self.models[n][fallY_min];  //落下先のブロックのmodelを上書き
                            delete self.models[n][fallY_min];   //落下元のブロックのmodelを削除
                        }
                        fallY_min --;
                    }
                }
            }
            ns.BlockCollection.prototype.setErasables(self);
        }
    });
})(this);
 
/**
 * 時間表示のView
 * 
 * カウント表示
 * カウントアップの開始と停止
 * 
 */
(function(window) {
    var ns = window.DIAMONDDASH || {};
 
    ns.TimeStatusView = Backbone.View.extend({
        properties: {
            sec: 0,
            timerId: undefined
        },
        initialize: function(options) {
        },
        start: function() {
            var self = this;
            this.properties.timerId = window.setInterval(function() {
                self.countUp();
            }, 1000);
        },
        stop: function() {
            window.clearInterval(this.properties.timerId);
        },
        countUp: function() {
            var prop = this.properties;
            prop.sec++;
            this.render(prop);
        },
        render: function(prop) {
            this.$el.html(prop.sec + '秒');
        }
    });
})(this);
 
/**
 * 全体のController
 * 各ビューは自身の振る舞い制御と、イベントをGameControllerへ通知
 * 
 * GameController
 * ├TimeStatusView
 * └BlockListView
 * 　└BlockView
 * 
 */
(function(window) {
    var ns = window.DIAMONDDASH || {},
        prop;
 
    ns.GameController = Backbone.View.extend({
        properties: {
            is_started: false,
        },
        initialize: function(options) {
            this.options = options;
            this.initBlockListView();
            this.initTimeStatusView();
        },
        initBlockListView: function() {
            this.blockListView = new ns.BlockListView({
                el: this.options.blockListEl
            });
            this.blockListView.collection.on('burst', this.gameOver);
            this.blockListView.collection.on('clear', this.gameClear);
        },
        initTimeStatusView: function() {
            this.timeStatusView = new ns.TimeStatusView({
                el: this.options.timeStatusEl
            });
        },
        events: {
            'click': 'gameStart'
        },
        gameStart: function() {
            if(this.properties.is_started === false) {
                this.timeStatusView.start();
            }
            this.properties.is_started = true;
        },
        gameClear: function() {
            // gameClear処理
            this.timeStatusView = new ns.TimeStatusView();
            this.timeStatusView.stop();
            setTimeout("alert('GAME CLEAR!')",200);
        }
    });
})(this);
 
/**
 * GameController起動
 */
(function(window) {
    var gameController = new DIAMONDDASH.GameController({
        el: $('#diamonddash'),
        blockListEl: $('#block_list'),
        timeStatusEl: $('#time_status')
    });
})(this);