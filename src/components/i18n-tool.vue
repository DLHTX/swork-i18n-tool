<template>
    <div class="i18n-tool-box tw-w-full tw-h-full dflex-uncenter">
        <div class="left-side tw-w-3/12 dflex-column">
            <div class="dflex-uncenter">
                <Button prefix="ios-add" class="tw-w-full" type="primary" @click="createTranslateFile">Create File
                </Button>
            </div>
            <div class="tw-mt-2 tw-w-full">
                <div class="text-center tw-mt-2" v-if="translateFileList.length==0">No data</div>
                <div class='community-ul' v-else>
                    <div class='community-li' v-for='(v,k) in translateFileList'
                         @click='handleFileClick(k)' :class='translateFileIdx==k?"community-li-active":""'>
                        <Icon class='fwb' :type='v.icon' v-if='v.icon'></Icon>
                        <Tooltip content="Double click to edit" placement="left">
                            <span v-if="curEditIdx!=k" @dblclick="curEditIdx=k">{{ v.name }}</span>
                            <Input v-else v-model="v.name" size="small" @on-blur="saveAndBlur(k)"/>
                        </Tooltip>
                        <Button type="error" size="small" class="tw-ml-auto delete-btn"
                                @click="deleteTranslateFile(v._id)">Delete
                        </Button>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-side tw-w-9/12 tw-ml-4 tw-pl-4" v-if="translateFileList.length!=0">
            <div class="dflex-uncenter">
                <Input v-model="searchText" placeholder="Search..."/>
                <Button prefix="ios-add" class="tw-ml-3" type="primary" @click="addTranslateRow">Add Row
                </Button>
                <Button type="warning" class="tw-ml-2" @click="startTranslate()">Translate</Button>
                <!--<Button type="warning" class="tw-ml-2" @click="TranslateGenerate()">Download File</Button>-->
            </div>
            <div class="tw-mt-2">
                <Tooltip content="click to add table column" v-for="(item,index) in toLangList">
                    <Tag size="large" @click.native="addTranslateColumn(item)">{{ item.label }}</Tag>
                </Tooltip>
            </div>
            <div class="text-red tw-mt-1">
                Tips:The lock button can prevent it from being overwritten during automatic translation
            </div>
            <Table :height="tableHeight" :key="random" class="tw-mt-3" ref="table" align="center" size="small"
                   :loading="loading"
                   :columns="tableColumns"
                   :data="data" :width="rightSideWidth">
                <template slot-scope="{ row, index }" slot="#">
                    {{ index + 1 }}
                </template>
                <template slot-scope="{ row, index }" slot="key">
                    <Input size="small" v-model="row.key" @on-blur="updateTranslateRow(row)"/>
                </template>
                <template slot-scope="{ row, index }" slot="en">
                    <Input size="small" v-model="row.en.text" @on-blur="updateTranslateRow(row)"/>
                </template>

                <template slot-scope="{ row, index }" slot="action">
                    <div class="dflex">
                        <i class="hover-red  ivu-icon iconfont icon-trash ios-icon hover-invert text-red "></i>
                    </div>
                </template>
            </Table>
        </div>
    </div>
</template>

<script>
const renderHeader = (h, params, _self, v) =>
    h("div", [
        h("span", params.column.title),
        h("Icon", {
            props: {
                type: "md-trash",
                size: "15",
                color: "#e54d42",
            },
            style: {
                marginRight: "5px",
                cursor: "pointer",
            },
            on: {
                click: () => {
                    _self.deleteColumn(v);
                },
            },
        }),
    ]);


const renderColumnTranslate = (h, params, _self, v) =>
    h("div", [
        h("Input", {
            props: {
                size: "mini",
                type: "text",
                value: _self.data[params.index][v].text,
            },
        }),
        h("Icon", {
            props: {
                type:
                    _self.data[params.index][v].status == 'unlock'
                        ? "ios-unlock-outline "
                        : "md-lock",
                size: "22",
            },
            style: {
                cursor: "pointer",
                marginRight: "5px",
                marginLeft: "5px",
            },
            on: {
                click: () => {
                    if (_self.data[params.index][v].status == 'unlock') {
                        _self.translateLock(params.index, v, true);
                    } else {
                        _self.translateLock(params.index, v, false);
                    }
                },
            }
        })
    ]);

let ACCEPT_FIELDS = []
export default {
    name: "i18n-tool",
    components: {},
    data() {
        return {
            curEditIdx: -1,
            tableHeight: null,
            rightSideWidth: null,
            searchText: "",
            translateFileList: [],
            translateFileIdx: 0,
            project_id: null,
            tableColumns: [
                {
                    title: "#",
                    slot: "#",
                    width: 50,
                    align: "center",
                },
                {
                    title: "key",
                    slot: "key",
                    align: "center",
                    minWidth: 120

                },
                {
                    title: "英语",
                    slot: "en",
                    align: "center",
                    minWidth: 120
                },
                {
                    title: "Action",
                    slot: "action",
                    align: "center",
                    fixed: 'right',
                    width: 80,
                }
            ],
            dynamicColumn: [],
            data: [],
            loading: false,
            toLangList: [],
            random: new Date().getTime(),
            translateInterval: [],
        }
    },
    watch: {
        '$app.sworkData.curProject.project._id': function () {
            this.getTranslateFiles()
        }
    },
    mounted() {
        this.project_id = this.$app.sworkData.curProject.project._id
        this.getTranslateFiles()
        this.tableHeight = document.getElementsByClassName('i18n-tool-box')[0].clientHeight - 100
        this.$nextTick(() => {
            this.rightSideWidth = document.getElementsByClassName('right-side')[0].clientWidth
        })
        // window.addEventListener('resize', () => this.tableHeight = document.getElementsByClassName('i18n-tool-box')[0].clientHeight - 100, false)
    },
    methods: {
        startTranslate() {
            this.$api.startTranslate(this.project_id, this.translateFileList[this.translateFileIdx]._id).then(res => {
                this.$Message.success('translating')
                this.$api.translateInQueue()
                this.getTranslateProcess()
            })
        },
        getTranslateProcess() {
            return new Promise((resolve, reject) => {
                this.$api.getTranslateProcess(this.project_id, this.translateFileList[this.translateFileIdx]._id).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        translateLock(index, key, status) {
            this.data[index][key].status = status ? 'lock' : 'unlock'
            this.random = new Date().getTime()
            this.updateTranslateRow(this.data[index])
        },
        TranslateGenerate() {
            console.log(this.data)
            // this.translateAllRows(this.data)
        },
        async deleteColumn(param) {
            this.data.forEach((item, index) => {
                for (let key in item) {
                    if (key == param) {
                        delete this.data[index][key]
                        delete this.data[index][key + '_lock']
                    }
                }
            })
            this.tableColumns.forEach((item, index) => {
                if (item.slot == param) {
                    this.tableColumns.splice(index, 1)
                }
            })
            this.random = new Date().getTime()
            await this.getLanguage()
            this.spliceLangTag()
        },
        updateTranslateRow(row) {
            console.log(row)
            this.$api.saveTranslate(this.project_id, this.translateFileList[this.translateFileIdx]._id, {rows: [this.toDatabase(row)]}).then(res => {

            })
        },
        addTranslateRow() {
            let obj = {key: "", en: {text: "", status: "unlock"}};
            this.$api.addTranslateRow(this.project_id, this.translateFileList[this.translateFileIdx]._id, obj).then(res => {
                this.$Message.success('Add Success')
                this.getTranslateRows()
            })
        },
        handleFileClick(index) {
            this.translateFileIdx = index
            this.getTranslateRows(index)
        },
        getTranslateRows(index) {
            this.loading = true
            this.$api.getTranslateRows(this.project_id, this.translateFileList[index ? index : this.translateFileIdx]._id).then(async res => {
                this.loading = false
                this.data = res.data
                this.tableColumns.forEach((item, index) => {
                    if (item.is_dynamic) {
                        this.tableColumns.splice(index, 1)
                    }
                })

                this.random = new Date().getTime()
                await this.getLanguage()
                this.spliceLangTag()
            }).catch(() => {
                this.loading = false
            })
        },
        spliceLangTag() {
            this.dynamicColumn = []
            if (this.data.length > 0) {
                for (let key in this.data[0]) {
                    this.toLangList.forEach((item, index) => {
                        if (key == item.value) {
                            if (!this.tableColumns.some(v => v.slot == key)) {
                                this.dynamicColumn.push({
                                    title: item.label,
                                    slot: item.value,
                                    align: "center",
                                    width: "150",
                                    is_dynamic: true,
                                    render: (h, params) =>
                                        renderColumnTranslate(h, params, this, item.value),
                                    renderHeader: (h, params) => renderHeader(h, params, this, item.value),
                                })
                            }
                            this.toLangList.splice(index, 1)
                            this.$forceUpdate()
                            this.random = new Date().getTime()
                        }
                    })
                }
                this.tableColumns = this.tableColumns.concat(this.dynamicColumn)
            }
        },
        addTranslateColumn(row) {
            console.log(row)
            //translate_file_id
            // this.data.forEach(item => {
            //     item[row.value] = ""
            // })
            this.saveTranslateFile({target: [row.value]})
            // this.$forceUpdate()
            // this.spliceLangTag()
        },
        saveAndBlur(index) {
            this.saveTranslateFile({translateName: this.translateFileList[index].name, index})
        },
        saveTranslateFile({translateName, target, index}) {
            this.$api.saveTranslateFile(this.project_id, this.translateFileList[index ? index : this.translateFileIdx]._id, {
                name: translateName ? translateName : this.translateFileList[index ? index : this.translateFileIdx].name,
                target: target ? target : []
            }).then(res => {
                this.curEditIdx = -1
                this.getTranslateRows()
            })
        },
        getLanguage() {
            return new Promise((resolve, reject) => {
                this.$api.getLanguage().then(res => {
                    //默认从英文来翻译
                    this.toLangList = []
                    ACCEPT_FIELDS = ['_id', 'key', 'en']
                    if (res.from_to.en) {
                        for (let key in res.from_to.en) {
                            this.toLangList.push({
                                label: res.from_to.en[key],
                                value: key
                            })
                            ACCEPT_FIELDS.push(key)
                        }
                    }

                    resolve()
                }).catch(err => reject())
            })
        },
        createTranslateFile() {
            this.$api.createTranslateFile(this.project_id, {
                name: "New translate file " + (this.translateFileList.length + 1)
            }).then(res => {
                this.$Message.success('Create Success')
                this.getTranslateFiles()
            })
        },
        getTranslateFiles() {
            this.$api.getTranslateFiles(this.project_id, {}).then(res => {
                this.translateFileList = res
                if (this.translateFileList.length > 0) {
                    this.getTranslateRows(0)

                }
            })
        },
        deleteTranslateFile(id) {
            this.$Modal.confirm({
                title: 'Are You Sure',
                content: '<p>Are you sure you want to delete it?</p>',
                onOk: () => {
                    this.$api.deleteTranslateFile(this.project_id, id).then(res => {
                        this.$Message.success('Delete Success')
                        this.getTranslateFiles()
                        this.getTranslateRows(0)
                    })
                },
                onCancel: () => {

                }
            });
        },
        toDatabase(params) {
            let data = {};
            for (let i of ACCEPT_FIELDS) {
                if (!params.hasOwnProperty(i)) continue;
                data[i] = params[i];
            }
            return data;
        },
    }
}
</script>

<style lang="less">
.i18n-tool-box {
    align-items: flex-start;

    .ivu-table-wrapper .ivu-table-tbody .ivu-table-cell > div {
        display: flex;
        align-items: center;
        background: #fff;
    }

    .left-side {
        background: white;
        height: 100%;
        align-items: flex-start;
        justify-content: flex-start;
    }

    .right-side {
        border-left: 1px solid #efefef;
        height: 100%;
    }


    .community-ul {
        .community-li {
            display: flex;
            align-items: center;
            padding: 12px 10px;
            border-radius: 4px;
            transition: all .3s;
            margin-top: 2px;
            cursor: pointer;

            .delete-btn {
                opacity: 0;
                visibility: hidden;
                transition: all .3s;
            }

            &:hover .delete-btn {
                opacity: 1;
                visibility: visible;
                transition: all .3s;
            }

            i {
                margin-right: 6px;
            }

            &:hover {
                background: #ececec;
                transition: all .3s;
            }
        }

        .community-li-active {
            i {
                color: #3189fc;
            }

            color: #3189fc;
            background: #cce5ff;
        }
    }
}
</style>