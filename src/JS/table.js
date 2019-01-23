



    // User Data

    var vue_user_data = new Vue ({
        el: '#user_data',
        data: function(){
        	return userData;
        },
        methods: {   
        }
    })


    // Component: wishlist-item

    Vue.component( 'wishlist-item', {
        props: ['class_item'],
        template: [
            '<div v-if="class_item.isSeen" class="list_course_item" @mouseover="mouseoverItem" @mouseout="mouseoutItem" >',
                '<div class="list_course_item_left">',
                    '<p class="list_course_item_category text_20 text_white clickable" @click="deleteItem" :class="getClass()"> {{ class_item.category }} </p>',
                '</div>',
                '<div class="list_course_item_mid" @click="addToTable">',
                    '<p class="list_course_item_title text_16">{{ class_item.dept_id }}-{{ class_item.class_id }} {{ class_item.title }}</p>',
                    '<p class="list_course_item_description text_14 text_dark">{{ class_item.teacher }} — {{ class_item.time }}</p>',
                '</div>',
                '<div class="list_course_item_right" @click="addToTable">',
                    '<div class="list_course_item_button"></div>',
                '</div>',
            '</div>'
        ].join(''),
        methods: {
            getClass: function() {
                var class_context = this.class_item.dept_id ;
                return class_context;
            },
            addToTable: function () {
                if ( checkConflict ( this.class_item, vue_classtable ) ) {
                    wishlistRemove( this.class_item.id );
                    vue_classtable.tableTempAdd( this.class_item.id );
                    vue_classtable.clearFilterCell();
                }
            },
            deleteItem: function () {
                console.log ( 'wishlist killed: ' +  vue_wishlist.wishlist_cont.indexOf( this.class_item ) + ' (' + this.class_item.title + ')' ); 
                wishlistRemove( this.class_item.id );
            },
            mouseoverItem: function () {
                if ( checkConflict ( this.class_item, vue_classtable ) ) {
                    vue_classtable.refresh( this.class_item.id );
                }
            },
            mouseoutItem: function () {
                vue_classtable.refresh();
            }
        }
    })


    // Wishlist

    var vue_wishlist = new Vue({
        el: '#wishlist_in_table',
        data: {
            wishlist_cont: [],
            page_status: pageStatus,
        },
        methods: {
            refresh: function () { 
                this.wishlist_cont.length = 0;
                for ( var i = 0 ; i < userData.now_wishlist.length ; i ++ ) {
                    var class_item = getClassObject ( course_db, userData.now_wishlist[i] ) ;
                    class_item.isSeen = true;
                    this.wishlist_cont.push( class_item );
                }
                this.clearFilter() ;
            },
            clearFilter: function () {
                // 重新將所有 wishlist item 設為可見
                for ( var i = 0 ; i < this.wishlist_cont.length ; i ++ ) {
                    this.wishlist_cont[i].isSeen = true ;
                }
            },
            filterItemTIme: function ( filter_day, filter_time ) {
                // 篩選出不符合條件的 item 設為不可見
                filter_time = textTransTime( filter_time );
                for ( var i = 0 ; i < this.wishlist_cont.length ; i ++ ) {
                    var wishlist_item_day = getTimeObject(this.wishlist_cont[i])[0].day ;
                    var wishlist_item_start = getTimeObject(this.wishlist_cont[i])[0].start ;
                    wishlist_item_start = textTransTime( wishlist_item_start );
                    var wishlist_item_end = parseInt(wishlist_item_start) + getTimeObject(this.wishlist_cont[i])[0].hrs - 1 ;
                    if ( filter_day == wishlist_item_day && filter_time >= wishlist_item_start && filter_time <= wishlist_item_end ) {
                    }
                    else {
                        this.wishlist_cont[i].isSeen = false ;
                    }
                }
            }
        }
    })


    
    // Component: result-list-item

    Vue.component( 'result-list-item', {
        props: ['class_item'],
        template: [
            '<div class="list_course_item"  @mouseover="mouseoverItem" @mouseout="mouseoutItem" >',
                '<div class="list_course_item_left">',
                    '<p class="list_course_item_category text_20 text_white" :class="getClass()"> {{ class_item.category }} </p>',
                '</div>',
                '<div class="list_course_item_mid" @click="addToTable">',
                    '<p class="list_course_item_title text_16">{{ class_item.dept_id }}-{{ class_item.class_id }} {{ class_item.title }}</p>',
                    '<p class="list_course_item_description text_14 text_dark">{{ class_item.teacher }} — {{ class_item.time }}</p>',
                '</div>',
                '<div class="list_course_item_right" @click="addToTable">',
                    '<div class="list_course_item_button"></div>',
                '</div>',
            '</div>'
        ].join(''),
        methods: {
            getClass: function() {
                var class_context = this.class_item.dept_id ;
                return class_context;
            },
            addToTable: function () {
                if ( checkConflict ( this.class_item, vue_classtable ) ) {
                    // todo: 按下加入後從清單裡消失( 像 wishlist 那樣)（改成標記）
                    vue_classtable.tableTempAdd( this.class_item.id );
                    vue_classtable.clearFilterCell();
                }
            },
            mouseoverItem: function () {
                if ( checkConflict ( this.class_item, vue_classtable ) ) {
                    vue_classtable.refresh( this.class_item.id );
                }
            },
            mouseoutItem: function () {
                vue_classtable.refresh();
            }
        }
    })


    // Quick Search

    var vue_quick_search = new Vue({
        el: '#quick_search',
        data: {
            keyword: '', 
            result_cont: [],
            filter_status: false,
            title_text: '快速添加',
            page_status: pageStatus,
        },
        computed: {
            result: function () {
    			this.result_cont = [];
                this.result_cont.length = 0;
                if ( this.keyword ) {
                    for ( var i = 0 ; i < course_db.length ; i ++ ) {           // todo: 讓已經在 table 或 wishlist 的課程不顯示
                        if ( course_db[i].課程名稱.match ( this.keyword ) || course_db[i].老師.match ( this.keyword ) ) {
                            var class_item = getClassObject ( course_db, course_db[i].id ) ;
                            if ( getTimeObject ( class_item ) ) {
                                this.result_cont.push( class_item );
                            }
                        }
                    }
                }
                return ;
            }
        },
        methods: {
            filterMode: function ( command, filter_day, filter_time ) {
                if ( command == 'on' ) {
                    this.keyword = '正在篩選：[' + textTransDay(filter_day) + ']' + filter_time ;
                    this.filter_status = true ;
                    this.title_text = '篩選時段';
                }
                else if ( command == 'off' ) {
                    this.keyword = '';
                    this.filter_status = false ;
                    this.title_text = '快速添加';
                }
            },
            clearFilter: function () {
                if ( this.filter_status ) {
                    this.filterMode( "off" );
                    vue_classtable.clearFilterCell();
                    vue_wishlist.clearFilter();
                }
            }
        }
    })


    // Component: class-table-cell

    Vue.component( 'class-table-cell', {
        props: ['day','cell_data'],
        template: [
            '<div class="class_table_cont_cell class_cell" :style="getHeight()" @click="startFilterTIme" :class="getClass()" >',
                '<div class="class_table_cont_cell_button" @click="deleteItem"></div>',
                '<p class="class_table_cont_cell_id text_12" :class="[{ previewing: cell_data.ifPreview }, { rush: cell_data.ifRush }]"> {{ cell_data.cell_status_title }} </p>',
                '<p class="class_table_cont_cell_title text_16 text_bold"> {{ cell_data.cell_status_text }} </p>',
                '<p v-if="cell_data.status > 1" class="class_table_cont_cell_description text_14 text_dark"> {{ cell_data.class_item.teacher }} </p>',
            '</div>'
        ].join(''),
        created: function () {
        },
        methods: {
            getHeight: function() {
                var style = '';
                // 計算該課程要佔據幾格
                if ( this.cell_data.status > 0 ) {
                    style += 'height: ' + this.cell_data.status * ( 100 / 9 ) + '%';
                }
                else if ( this.cell_data.status < 0 ) {
                    style += 'display: none';
                }
                return style;
            },
            getClass: function() {
                var class_context = '';
                if ( this.cell_data.status > 0 ) {
                    class_context += 'occupied ';
                }
                if ( this.cell_data.ifFilterTime ) {
                    class_context += 'filtering ';
                }
                if ( this.cell_data.ifPreview ) {
                    class_context += 'previewing ';
                }
                if ( this.cell_data.ifRush ) {
                    class_context += 'rush ';
                }
                class_context += this.cell_data.class_item.dept_id ;
                return class_context;
            },
            deleteItem: function() {
                if ( this.cell_data.status > 0 ) {
                    wishlistAdd( this.cell_data.class_item.id );
                    vue_classtable.tableTempRemove( this.cell_data.class_item.id );
                }
            },
            startFilterTIme: function() {
                if ( this.cell_data.status == 0 && ! pageStatus.table_locked ) {
                    var filtering = vue_classtable.markFilterCell( this.day, this.cell_data.time );
                    if ( filtering ) {
                        vue_wishlist.clearFilter() ;
                        vue_wishlist.filterItemTIme( this.day, this.cell_data.time );
                    }
                    else {
                        vue_wishlist.clearFilter() ;
                    }
                }
            }
        }
    })


    // Class Table

    var vue_classtable = new Vue ({         // todo: 篩選中願望清單文字改為「符合此時段」，若為空則需顯示提示文字
        el: '#class_table',
        data: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            filtering_now: {
                day: '',
                time: ''
            },
            page_status: pageStatus,
            temp_table: []
        },
        created: function() {
            // 產生空白表格
            var day, time ;
            for ( var i = 1 ; i <= 5 ; i ++ ) {
                day = dayTransText(i);
                this[day].length = 0;
                for ( var j = 1 ; j <= 15 ; j ++ ) {
                    time = timeTransText(j).toString();
                    this[day].push( { time: time, status: 0, class_item: '', ifFilterTime: false, cell_status_title: '篩選課程', cell_status_text:'選擇此時段' } ); 
                    // status： 1 以上 - 該課程佔據節次數、 0 - 該節次無課程、 (-1) - 該節次已被上方課程佔據
                }
            }
        },
        methods: {
            initialize: function() {
                this.temp_table.length = 0;
                for ( var i = 0 ; i < userData.now_table.length ; i ++ ) {
                    this.temp_table.push( userData.now_table[i] );
                }
                this.refresh();
            },
            // 輸入課程 id、課程資料庫，將課程加入課表
            toTable: function ( target_id, course_db, ifPreview ) {
                var class_item = getClassObject ( course_db, target_id ); 
                var time_item = getTimeObject ( class_item );
                if ( checkConflict ( class_item, this ) ) {
                    // 完成填入課表
                    var day, start, hrs;
                    for ( var i = 0 ; i < time_item.length ; i ++ ) {
                        day = time_item[i].day;
                        start = time_item[i].start;
                        hrs = time_item[i].hrs;
                        for ( var j = 0 ; j < hrs ; j ++ ) {
                            // 在起始時段填入課程資訊
                            fill_cell = this[day].find( function ( item ) {
                                return item.time == start 
                            });
                            fill_cell.status = hrs ;
                            fill_cell.class_item = class_item;
                            fill_cell.cell_status_title = fill_cell.class_item.dept_id + '-' + fill_cell.class_item.class_id ;;
                            fill_cell.cell_status_text = fill_cell.class_item.title;
                            if ( ifPreview ) {
                                fill_cell.ifPreview = true;
                            }
                            // 將後續時段的 status 設定為 -1
                            for ( var k = 1 ; k < hrs ; k ++ ) {
                                fill_cell =  this[day].find( function ( item ) {
                                    return item.time == timeTransText( textTransTime(start) + k )
                                });
                                fill_cell.status = -1;
                                fill_cell.cell_status_title = '';
                                fill_cell.cell_status_text = ''; 
                            }
                        }
                    }
                    return 1;
                }
                else {
                    return 0;
                }
            },
            refresh: function ( preview_id ) {
                var message = '目前課表課程：';
                for ( var i = 0 ; i < this.temp_table.length ; i ++ ) {
                    message += this.temp_table[i] + ' ' ;
                }
                console.log ( message );
                var message2 = '線上課表課程：';
                for ( var i = 0 ; i < userData.now_table.length ; i ++ ) {
                    message2 += userData.now_table[i] + ' ' ;
                }
                console.log ( message2 );
                // 產生空白表格
                var day, time ;
                for ( var i = 1 ; i <= 5 ; i ++ ) {
                    day = dayTransText(i);
                    this[day].length = 0;
                    for ( var j = 1 ; j <= 15 ; j ++ ) {
                        time = timeTransText(j).toString();
                        this[day].push( { time: time, status: 0, class_item: '', ifFilterTime: false, cell_status_title: '篩選課程', cell_status_text:'選擇此時段' } ); 
                        // status： 1 以上 - 該課程佔據節次數、 0 - 該節次無課程、 (-1) - 該節次已被上方課程佔據
                    }
                }
                // 加入目前課表
                for ( var i = 0 ; i < this.temp_table.length ; i ++ ) {
                    var target_id = this.temp_table[i];
                    this.toTable ( target_id, course_db );
                }
                // 加入預覽中課程（wishlist） 
                if ( preview_id ) {
                    this.toTable ( preview_id, course_db, true );
                }
                // 加入篩選中時段
                if ( this.filtering_now.day && this.filtering_now.time ) {
                    this.markFilterCell ( this.filtering_now.day , this.filtering_now.time );
                }
            },
            markFilterCell: function ( filter_day, filter_time ) {
                var filter_cell = this[filter_day].find( function ( item ) {
                    return item.time == filter_time
                });
                if ( filter_cell.ifFilterTime ) {
                    // 若點擊正在篩選中的格子則取消篩選狀態
                    this.clearFilterCell();
                    vue_quick_search.filterMode( 'off' );
                    return 0 ;
                }
                else {
                    // 若點擊非篩選中的格子則開始進行篩選
                    this.clearFilterCell();
                    filter_cell.ifFilterTime = true;
                    this.filtering_now.day = filter_day;
                    this.filtering_now.time = filter_time;
                    vue_quick_search.filterMode( 'on', filter_day, filter_time );
                    return 1 ;
                }
            },
            clearFilterCell: function () {
                var day, time, now_cell ;
                for ( var i = 1 ; i <= 5 ; i ++ ) {
                    day = dayTransText(i);
                    for ( var j = 1 ; j <= 15 ; j ++ ) {
                        time = timeTransText(j).toString();
                        now_cell = this[day].find( function ( item ) {
                            return item.time == time
                        });
                        now_cell.ifFilterTime = false;
                    }
                }
                this.filtering_now.day = '';
                this.filtering_now.time = '';
                vue_quick_search.keyword = '';
            },
            tableTempAdd: function ( target_id ) {
                this.temp_table.push( target_id );
                this.refresh();
            },
            tableTempRemove: function ( target_id ) {
                var index = this.temp_table.indexOf( target_id );
                this.temp_table.splice( index, 1 );
                this.refresh();
            },
            tableConfirm: function () {;
                userData.now_table.length = 0;
                for ( var i = 0 ; i < this.temp_table.length ; i ++ ) {
                    userData.now_table.push( this.temp_table[i] );
                }
                tableUpload();
            },
            tableGiveUp: function () {
                this.initialize();
                this.refresh();
            }
        }
    }) 



    /* todos
    
    ( bugs )
    1. 幹細胞技術、航空運輸管理：禮拜六上課 / 時段未定 / 「天次」跟「節次」不在合理範圍者，需安排至「其他」
    2. 幹細胞生物學：無法正確顯示預覽（實際上是衝堂但卻沒有顯示衝堂）- 似乎因為衝堂並不是衝第一堂，衝堂檢查須再修正
    3. 習醫之道：共有四個，前三個不知為何不會正常顯示（實際時段是啥？調查一下）
    4. 篩選時段 - 加入課表 - wishlist 不會回復原狀？
    5. hover wishlist - 產生衝堂 - 刪除 wishlist item - 衝堂不會消失？
    6. 放棄課表的話，wishlist 不會回復到原樣。

    ( ui / ux )
    1. 課表空空時的文字提示
    2. wishlist, result_list 在 item 消失時可以淡出或滑行ㄇ
    3. quick_search 下拉選單會讓 wishlist 很難閱讀，是否淡化處理背景？
    4. 課表 locked - unlocked 的中斷感消除（transition）
    5. 從課表左移回到 wishlist，是否該讓他自動滑到最下方已顯示課程？
        https://cn.vuejs.org/v2/guide/transitions.html

    */