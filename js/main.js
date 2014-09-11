/**
 * Diamond Dash関連オブジェクトを格納するNamespace
 */
var DIAMONDDASH = DIAMONDDASH || {};
 
/**
 * BlockのModel
 * 
 * BlockModelで初期値を設定
 * BlockCollectionに、modelの更新処理を記述
 */
(function(window) {
    var ns = window.DIAMONDDASH || {};

    ns.BlockModel = Backbone.Model.extend({
        defaults: {
            blockColor: 0,      //0:赤、1:黄、2:紫、3:緑、4:青
            blockX: 0,          //ブロックのX座標（0〜6）
            blockY: 0,          //ブロックのY座標（0〜7）
            id: '0_0',          //ブロックの座標を表すID
            erasable: false,    //消せるかどうか
            group: undefined    //消せるブロックグループ
        }
    });

    ns.BlockCollection = Backbone.Collection.extend({
        model: ns.BlockModel,
        properties: {
            blockListX: 7,       //列の数
            blockListY: 8,       //行の数
            delteBlocksCount: 0 //消したブロックの総数
        },
        initialize: function() {
            this.collection = this.createBlockModels();
            this.initCheckFlg(7, 8);//チェック済みか管理するフラグ配列定義（7×8）
            this.groupCount = 0;//グループID定義
            this.sameBlockCount = 0;//繋がっている同じブロックの総数
            this.updateErasables();
        },
        initCheckFlg: function(x, y){
            var i;
            this.checkFlg = new Array(x);
            for(i=0; i<x; i++){
                this.checkFlg[i] = new Array(y)
            }
        },
        //ブロックカラーをランダムで設定するメソッド
        createBlockModels: function() {
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
        updateErasables: function() {
            var x, xl, y, yl;
            this.sameBlockCount = 0;

            for(x=0, xl=this.checkFlg.length; x < xl; x++) {
                for(y=0, yl=this.checkFlg[x].length; y<yl; y++) {
                    if(this.models[x][y] != undefined) {
                        this.models[x][y].set('erasable', false);
                        this.models[x][y].set('group', this.groupCount);
                        this.checkAroundBlock(this.checkFlg, x, y);
                    }
                    if(this.sameBlockCount >= 3) {
                        this.groupCount ++;
                    }
                }
            }
        },
        checkAroundBlock: function(x, y){
            this.checkTopBlock(x, y);
            this.checkLeftBlock(x, y);
            this.checkRightBlock(x, y);
            this.checkBottomBlock(x, y);
            if(this.sameBlockCount >= 3) {
                this.models[x][y].set('group', this.groupCount);
                this.models[x][y].set('erasable', true);
            }
        },
        checkTopBlock: function(x, y){
            if(y > 0 && this.models[x][y - 1] != undefined) {
                if(this.models[x][y].get('blockColor') == this.models[x][y - 1].get('blockColor')) {
                    if(this.models[x][y - 1].get('group') == undefined && this.checkFlg[x][y - 1] == undefined) {
                        this.checkFlg[x][y - 1] = 1;
                        this.sameBlockCount ++;
                        if(this.sameBlockCount >= 3) {
                            this.models[x][y].set('group', this.groupCount);
                            this.models[x][y - 1].set('group', this.groupCount);
                        }
                        this.checkAroundBlock(x, y - 1);
                    }
                }
            }
        },
        checkLeftBlock: function(x, y){
            if(x > 0 && this.models[x - 1][y] != undefined) {
                if(this.models[x][y].get('blockColor') == this.models[x - 1][y].get('blockColor')) {
                    if(this.models[x - 1][y].get('group') == undefined && this.checkFlg[x - 1][y] == undefined) {
                        this.checkFlg[x - 1][y] = 1;
                        this.sameBlockCount ++;
                        if(this.sameBlockCount >= 3) {
                            this.models[x][y].set('group', this.groupCount);
                            this.models[x - 1][y].set('group', this.groupCount);
                        }
                        this.checkAroundBlock(x - 1, y);
                    }
                }
            }
        },
        checkRightBlock: function(x, y){
            if(x < 6 && this.models[x + 1][y] != undefined) {
                if(this.models[x][y].get('blockColor') == this.models[x + 1][y].get('blockColor')) {
                    if(this.models[x + 1][y].get('group') == undefined && this.checkFlg[x + 1][y] == undefined) {
                        this.checkFlg[x + 1][y] = 1;
                        this.sameBlockCount ++;
                        if(this.sameBlockCount >= 3) {
                            this.models[x][y].set('group', this.groupCount);
                            this.models[x + 1][y].set('group', this.groupCount);
                        }
                        this.checkAroundBlock(x + 1, y);
                    }
                }
            }
        },
        checkBottomBlock: function(x, y){
            if(y < 7 && this.models[x][y + 1] != undefined) {
                if(this.models[x][y].get('blockColor') == this.models[x][y + 1].get('blockColor')) {
                    if(this.models[x][y + 1].get('group') == undefined && this.checkFlg[x][y + 1] == undefined) {
                        this.checkFlg[x][y + 1] = 1;
                        this.sameBlockCount ++;
                        if(this.sameBlockCount >= 3) {
                            this.models[x][y].set('group', this.groupCount);
                            this.models[x][y + 1].set('group', this.groupCount);
                        }
                        this.checkAroundBlock(x, y + 1);
                    }
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
                    lis[id].on('blockClick', $.proxy(this.blockGroupDelete, this));
                    this.$el.append(lis[id].el);
                    id ++;
                }
            }
        },
        //３つ以上隣接してるブロックグループを消去
        blockGroupDelete: function(event, self) {
            // console.log('group=' + self.attributes.group);
            // console.log('消える？' + self.attributes.erasable);
            // console.log(this);
            // console.log(self);
            var deletedBlocks = []; //消したブロックの座標情報
            var i = 0;
            for(var y = 0; y < 8; y ++) {
                for(var x = 0; x < 7; x ++) {
                    // console.log(this.models[x][y].get('group'));
                    if(this.collection.models[x][y] != undefined) {
                        if(this.collection.models[x][y].get('group') != undefined) {
                            if(this.collection.models[x][y].get('group') == self.attributes.group && this.collection.models[x][y].get('erasable') == true) {
                                $('#' + x + '_' + y).addClass('hidden');
                                deletedBlocks[i] = [];
                                deletedBlocks[i].push(x,y);
                                i++;
                            } 
                        }
                    }
                }
            }
            this.blockFall(deletedBlocks, self);
        },
        //ブロックの落下処理
        blockFall: function(deletedBlocks, view) {
            self = this;
            var blockXY = this.setFallBlock(deletedBlocks);
            this.blockFallRender(view, blockXY);
        },
        //X座標毎に落下するブロックの数と座標を設定する処理
        setFallBlock: function(deletedBlocks) {
            var x = [];
            var y_x = [];
            for(var i = 0; i <= 6; i++) {
               x[i] = 0;    //各x座標毎の落下数を入れる変数定義
               y_x[i] = []; //消えたブロックのあるx座標の内、最小のy座標の候補を入れる変数
            }
            _.each(deletedBlocks,function(num) {
                switch(num[0]) {
                    case 0:
                        x[0] ++;
                        y_x[0].push(num[1]);
                        break;
                    case 1:
                        x[1] ++;
                        y_x[1].push(num[1]);
                        break;
                    case 2:
                        x[2] ++;
                        y_x[2].push(num[1]);
                        break;
                    case 3:
                        x[3] ++;
                        y_x[3].push(num[1]);
                        break;
                    case 4:
                        x[4] ++;
                        y_x[4].push(num[1]);
                        break;
                    case 5:
                        x[5] ++;
                        y_x[5].push(num[1]);
                        break;
                    case 6:
                        x[6] ++;
                        y_x[6].push(num[1]);
                        break;
                }
            });
            return [x, y_x];
        },
        //実際の落下処理（レンダリングとmodelの更新）
        blockFallRender: function(view, blockXY) {
            var fallY_max = 0;  //そのX座標上で消えるブロック内で最大のY座標
            var fallY_now = 0;  //チェック中のブロックのY座標を入れる変数
            var fallY_min = 0;  //そのX座標上で消えるブロック内で最小のY座標-1を入れる変数
            var fallCount = 0;  //そのX軸上で落としたブロックの数を入れる変数
            var tempY = 0;      //元のY位置を記憶しておく変数
            for(n = 0; n <= 6; n ++) {
                if(blockXY[0][n] != 0) {
                    //コの字型にブロックを消した際の処理
                    fallY_max = _.max(blockXY[1][n]); //そのX座標上で消えるブロック内で最大のY座標
                    fallY_now = fallY_max;
                    fallY_min = _.min(blockXY[1][n]) - 1; //そのX座標上で消えるブロック内で最小のY座標-1
                    fallCount = 0;  //そのX軸上で落としたブロックの数
                    while(fallY_now > fallY_min) {
                        if(self.collection.models[n][fallY_now] != undefined) {
                            if(self.collection.models[n][fallY_now].get('group') != view.attributes.group) {
                                tempY = $('#'+n+'_'+fallY_now).css('top');  //元のY位置を取得
                                tempY = Number(tempY.slice(0, -2));
                                $('#'+n+'_'+fallY_now).css('top', tempY + (40 * (fallY_max - fallY_now - fallCount)));
                                $('#'+n+'_'+fallY_now).attr('id', n + '_' + (fallY_max - fallCount)); //IDを更新
                                tempY = self.collection.models[n][fallY_now].get('blockY')
                                self.collection.models[n][fallY_now].set('blockY', (fallY_max - fallCount));     //modelのY座標を更新
                                self.collection.models[n][fallY_now].set('id', n + '_' + (fallY_max - fallCount));     //modelのIDを更新
                                self.collection.models[n][(fallY_max - fallCount)] = self.collection.models[n][fallY_now];  //落下先のブロックのmodelを上書き
                                delete self.collection.models[n][fallY_now];   //落下元のブロックのmodelを削除
                                fallCount ++;
                            }
                        }
                        fallY_now --;
                    }
                    while(fallY_min >= 0) {
                        //そのX座標のブロックの内、消えたブロックの最小のYより上にあるブロックに対する落下処理
                        if(self.collection.models[n][fallY_min] != undefined) {
                            tempY = $('#'+n+'_'+fallY_min).css('top');  //元のY位置を取得
                            tempY = Number(tempY.slice(0, -2));
                            $('#'+n+'_'+fallY_min).css('top', tempY + (40 * blockXY[0][n]));
                            $('#'+n+'_'+fallY_min).attr('id', n + '_' + (fallY_min + blockXY[0][n])); //IDを更新
                            tempY = self.collection.models[n][fallY_min].get('blockY')
                            self.collection.models[n][fallY_min].set('blockY', (fallY_min + blockXY[0][n]));     //modelのY座標を更新
                            self.collection.models[n][fallY_min].set('id', n + '_' + (fallY_min + blockXY[0][n]));     //modelのIDを更新
                            self.collection.models[n][(fallY_min + blockXY[0][n])] = self.collection.models[n][fallY_min];  //落下先のブロックのmodelを上書き
                            delete self.collection.models[n][fallY_min];   //落下元のブロックのmodelを削除
                        }
                        fallY_min --;
                    }
                }
            }
            self.collection.updateErasables();            
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