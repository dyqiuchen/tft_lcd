//% color=#008C8C icon="\uf26c"
namespace TFTLCD {
    /*****************************************************************************************************
     * I2C正式地址0x3D
     ****************************************************************************************************/
    const TFT_I2C_ADDR = 0x11;

    const CMD_SET_BACKLIGHT = 0x40;
    const CMD_DRAW_LINE = 0X10;
    const CMD_DRAW_RECT = 0x50;
    const CMD_DRAW_CIRCLE = 0x60;
    const CMD_CLEAR_SCREEN = 0x70;
    const CMD_SET_BACKGROUND_COLOR = 0x80;
    const CMD_SET_PEN_COLOR = 0x90;
    const CMD_DRAW_STRING = 0x30;
    const CMD_COORD_DRAW_STRING = 0x31;
    const CMD_CLEAR_LINE = 0x71;
    const CMD_DRAW_PROGRESS = 0xA0;
    const CMD_DRAW_CIRCULAR_LOADER = 0xA1;
    const CMD_IS_BUSY = 0xB0;
    const CMD_DRAW_HISTOGRAM = 0xC0;
    const CMD_DRAW_HISTOGRAM_DATA = 0xC1;
    const CMD_DRAW_PIE_CHART = 0xC2;

    let current_row = 0;

    export enum BlkCmdEnum {
        //%block="open"
        BlkOpen,
        //%block="close"
        BlkClose,
    }
    export enum LineNumEnum {
        //% block="1"
        Line_1 = 1,
        //% block="2"
        Line_2 = 2,
        //% block="3"
        Line_3 = 3,
        //% block="4"
        Line_4 = 4,
        //% block="5"
        Line_5 = 5,
        //% block="6"
        Line_6 = 6,
        //% block="7"
        Line_7 = 7,
        //% block="8"
        Line_8 = 8
    }

    export enum ChartNumColmun {
        //% block="1"
        Chart1 = 1,
        //% block="2"
        Chart2 = 2,
        //% block="3"
        Chart3 = 3,
        //% block="4"
        Chart4 = 4,
        //% block="5"
        Chart5 = 5,
        //% block="6"
        Chart6 = 6,
        //% block="7"
        Chart7 = 7,
        //% block="8"
        Chart8 = 8,
        //% block="9"
        Chart9 = 9,
        //% block="10"
        Chart10 = 10
    }

    export enum ChartNumGroup {
        //% block="1"
        Group1 = 1,
        //% block="2"
        Group2 = 2,
        //% block="3"
        Group3 = 3,
        //% block="4"
        Group4 = 4,
        //% block="5"
        Chart5 = 5
    }

    //% blockHidden=1
    //% blockId=LineNumEnum block="%value"
    export function selectLineNumEnum(value: LineNumEnum): number {
        return value;
    }
    //% blockHidden=1
    //% blockId=ChartNumColmun block="%value"
    export function selectChartNumColmun(value: ChartNumColmun): number {
        return value;
    }
    //% blockHidden=1
    //% blockId=ChartNumGroup block="%value"
    export function selectChartNumGroup(value: ChartNumGroup): number {
        return value;
    }

    export enum DrawType {
        //% block="Histogram"
        Histogram = 0,
        //% block="Linechart"
        Linechart = 1
    }

    //绘制坐标一行化
    export class DrawCoord {
        public x: number;
        public y: number;
        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
    }

    //% blockHidden=1
    //% blockId=drawCoord block="X: %x Y: %y"
    export function drawCoord(x: number, y: number): DrawCoord {
        return new DrawCoord(x, y);
    }

    //% blockHidden=1
    //% blockId=setMinMax block="min %min max %max"
    //% min.defl=0
    //% min.min=-32767 ymin.max=32767
    //% max.defl=0
    //% max.min=-32767 ymax.max=32767
    export function setMinMax(min: number, max: number): DrawCoord {
        return new DrawCoord(min, max);
    }



    /**
     * 校准运行时间,防止屏还未初始化就调用函数
     */
    function verify_runtime() {
        let time = 0;
        while (!pins.i2cReadNumber(TFT_I2C_ADDR, NumberFormat.Int8LE)) {
            time = input.runningTime() + 5;
            while (input.runningTime() < time) { }
        }
    }

    function adjust_charcode(code: number): number {
        return code < 0x20 || code > 0x7F ? 0x20 :code;
    }

    /******************************************************************************************************
     * 工具函数
     ******************************************************************************************************/
    export function i2cCommandSend(command: number, params: number[]) {
        let buff = pins.createBuffer(params.length + 4);
        buff[0] = 0xFF; // 帧头
        buff[1] = 0xF9; // 帧头
        buff[2] = command; // 指令
        buff[3] = params.length; // 参数长度
        for (let i = 0; i < params.length; i++) {
            buff[i + 4] = params[i];
        }
        pins.i2cWriteBuffer(TFT_I2C_ADDR, buff);
    }

    function change_row(row: number) {
        if (row) {
            current_row = (row - 1) % 8; // 非0 指定行
        }
        else {
            current_row = (current_row + 1) % 8; // 下一行
        }
    }

    //% block="set backlight %cmd"
    //% weight=100
    //% group="Basic"
    export function tftBacklightCtrl(cmd: BlkCmdEnum) {
        verify_runtime();
        i2cCommandSend(CMD_SET_BACKLIGHT, [cmd == BlkCmdEnum.BlkOpen ? 0x01 : 0x00]);
    }

    //% block="clear screen"
    //% weight=97
    //% group="Basic"
    export function tft_clear_screen() {
        verify_runtime();
        i2cCommandSend(CMD_CLEAR_SCREEN, [0]);
    }
    //% block="set background color %color"
    //% color.shadow="colorNumberPicker"
    //% color.defl=0xffffff
    //% group="Basic"
    //% weight=96
    export function tft_set_background_color(color: number) {
        verify_runtime();
        i2cCommandSend(CMD_SET_BACKGROUND_COLOR, [
            (color >> 16) & 0xff,
            (color >> 8) & 0xff,
            color & 0xff
        ]);
    }
    //% block="set draw pen color %color"
    //% color.shadow="colorWheelPicker"
    //% color.defl=#000000
    //% weight=95
    //% group="Basic"
    export function tft_set_pen_color(color: number) {
        verify_runtime();
        i2cCommandSend(CMD_SET_PEN_COLOR, [
            (color >> 16) & 0xff,
            (color >> 8) & 0xff,
            color & 0xff
        ]);
    }

    //% blockId=colorindexpicker blockHidden=true shim=TD_ID
    //% index.fieldEditor="colornumber"
    //% index.fieldOptions.valueMode="index"
    //% index.fieldOptions.colours='["#dedede","#ffffff","#ff2121","#ff93c4","#ff8135","#fff609","#249ca3","#78dc52","#003fad","#87f2ff","#8e2ec4","#a4839f","#5c406c","#e5cdc4","#91463d","#000000"]'
    //% index.fieldOptions.decompileLiterals="true"
    export function __colorIndexPicker(index: number) { 
        return index;
    }
    // block="show string %str"
    // weight=94
    // group="Basic"
    function tft_show_string(str: string) {
        verify_runtime();
        let arr = [];
        arr.push(current_row);
        for (let i = 0; i < str.length; i++) {
            arr.push(adjust_charcode(str.charCodeAt(i)));
        }
        arr.push(0);
        i2cCommandSend(CMD_DRAW_STRING, arr);
    }

    // block="show number %num"
    // num.defl=20
    // weight=93
    // group="Basic"
    function tft_show_num(num: number) {
        let str = "" + num;
        tft_show_string(str);
    }
    // block="Line breaks"
    // weight=91
    // group="Basic"
    function tft_new_line() {
        verify_runtime();
        current_row = 0;
    };


    //% block="select line %num=LineNumEnum and write string %str"
    //% weight=92
    //% group="Basic"
    export function tft_select_line_write_string(num: number, str: string) {
        verify_runtime();
        current_row = num - 1;
        tft_show_string(str);
    };

    //% block="select line %num=LineNumEnum clear"
    //% weight=93
    //% group="Basic"
    export function tft_select_line_clear(num: number) {
        verify_runtime();
        tft_select_line_write_string(num, "");
    };

    //% block="select line %num=LineNumEnum and write num %wnum"
    //% weight=90
    //% group="Basic"
    export function tft_select_line_write_num(num: number, wnum: number) {
        verify_runtime();
        current_row = num - 1;
        tft_show_num(wnum);
    };

    export function tft_clear_line(num: number) {
        verify_runtime();
        i2cCommandSend(CMD_CLEAR_LINE, [num]);
    };

    //% block="select %coord=drawCoord|write string %str"
    //% weight=85
    //% group="Basic"
    export function tft_select_coord_write_string(coord: DrawCoord, str: string) {
        verify_runtime();
        let arr = [
            coord.x >> 8 & 0xff,
            coord.x & 0xff,
            coord.y >> 8 & 0xff,
            coord.y & 0xff,
        ];
        for (let i = 0; i < str.length; i++) {
            arr.push(adjust_charcode(str.charCodeAt(i)));
        }
        arr.push(0);
        i2cCommandSend(CMD_COORD_DRAW_STRING, arr);
    };

    //% block="select %coord=drawCoord|write num %num"
    //% weight=80
    //% group="Basic"
    export function tft_select_coord_write_num(coord: DrawCoord, num: number) {
        verify_runtime();
        let str = "" + num;
        tft_select_coord_write_string(coord, str);
    };

    //% block="draw line |start %start=drawCoord|end %end=drawCoord"
    //% weight=55
    //% group="shape"
    //% inlineInputMode=external
    export function tft_draw_line(start: DrawCoord, end: DrawCoord) {
        verify_runtime();
        i2cCommandSend(CMD_DRAW_LINE, [
            start.x >> 8 & 0xff,
            start.x & 0xff,
            start.y >> 8 & 0xff,
            start.y & 0xff,
            end.x >> 8 & 0xff,
            end.x & 0xff,
            end.y >> 8 & 0xff,
            end.y & 0xff
        ]);
    }

    //% block="draw rectange |start %start=drawCoord|end %end=drawCoord|fill:%fill"
    //% fill.defl=false
    //% weight=50
    //% group="shape"
    //% inlineInputMode=external
    export function tft_draw_rect(start: DrawCoord, end: DrawCoord, fill: boolean) {
        verify_runtime();
        i2cCommandSend(CMD_DRAW_RECT, [
            start.x >> 8 & 0xff,
            start.x & 0xff,
            start.y >> 8 & 0xff,
            start.y & 0xff,
            end.x >> 8 & 0xff,
            end.x & 0xff,
            end.y >> 8 & 0xff,
            end.y & 0xff,
            fill ? 0x01 : 0x00
        ]);
    }

    //% block="draw circle|cen %cen=drawCoord|radius %r fill %fill"
    //% weight=45
    //% group="shape"
    //% inlineInputMode=external
    export function tft_draw_circle(cen: DrawCoord, r: number, fill: boolean) {
        verify_runtime();
        i2cCommandSend(CMD_DRAW_CIRCLE, [
            cen.x >> 8 & 0xff,
            cen.x & 0xff,
            cen.y >> 8 & 0xff,
            cen.y & 0xff,
            r >> 8 & 0xff,
            r & 0xff,
            fill ? 0x01 : 0x00
        ])
    }

    //% block="draw a circular loadercolor  %color"
    //% color.shadow="colorNumberPicker"
    //% color.defl=0x999999
    //% weight=40
    //% group="shape"
    export function tft_draw_circular_loader(color: number) {
        verify_runtime();
        //color RGB888位转RGB565
        i2cCommandSend(CMD_DRAW_CIRCULAR_LOADER, [
            color >> 16 & 0xff,
            color >> 8 & 0xff,
            color & 0xff
        ]);
    }

    //% block="Show loading bar %percent \\%"
    //% percent.defl=50
    //% percent.min=0 percent.max=100
    //% weight=30
    //% group="shape"
    export function tft_show_loading_bar(percent: number) {
        verify_runtime();
        i2cCommandSend(CMD_DRAW_PROGRESS, [percent]);
    };

    export class GroupInfo {
        public color: number;
        public name: string;
        constructor(color: number,name: string) {
            this.color = color;
            this.name = name;
        }
    }

    //% blockHidden=1
    //% blockId=createGroupInfo block="color %color label %name"
    //% color.shadow="colorNumberPicker"
    export function createGroupInfo(color: number,name: string): GroupInfo {
        return new GroupInfo(color,name);
    }

    //% block="draw %drawtype|set Y %yarray=setMinMax|set column %column=ChartNumColmun|group1 %group1=createGroupInfo||group2 %group2=createGroupInfo|group3 %group3=createGroupInfo|group4 %group4=createGroupInfo|group5 %group5=createGroupInfo|"
    //% expandableArgumentMode="enabled"
    //% weight=21
    //% column.defl=1
    //% column.min=1 column.max=10
    //% group="chart"
    //% inlineInputMode=external
    export function tft_draw_chart(drawtype: DrawType, yarray: DrawCoord, column: number,
        group1: GroupInfo = null,
        group2: GroupInfo = null,
        group3: GroupInfo = null,
        group4: GroupInfo = null,
        group5: GroupInfo = null) {
        verify_runtime();
        let arr = [
            yarray.x >> 8 & 0xff,
            yarray.x & 0xff,
            yarray.y >> 8 & 0xff,
            yarray.y & 0xff,
            column & 0xff,
            0,
            drawtype & 0xff
        ];
        let group_arr = [group1, group2, group3, group4, group5];
        let group_cnt = 0;
        for (let i = 0; i < 5; i++) {
            if (group_arr[i] == null) {
                break;
            }
            let len = group_arr[i].name.length;
            for (let j = 0; j < (len > 6 ? 3 : len); j++) {
                arr.push(group_arr[i].name.charCodeAt(j));
            }
            if (len > 6) {
                arr.push(".".charCodeAt(0))
                arr.push(".".charCodeAt(0))
                arr.push(".".charCodeAt(0))
            }
            arr.push(0)
            arr.push(group_arr[i].color >> 16 & 0xff)
            arr.push(group_arr[i].color >> 8 & 0xff)
            arr.push(group_arr[i].color & 0xff)
            group_cnt++;
        }
        arr[5] = group_cnt;

        i2cCommandSend(CMD_DRAW_HISTOGRAM, arr)
    }

    //% block="write chart data|set column %column=ChartNumColmun name as %name|data1 = %num1||data2 = %num2|data3 = %num3|data4 = %num4|data5 = %num5"
    //% expandableArgumentMode="enabled"
    //% weight=20
    //% column.defl=1
    //% column.min=1 column.max=10
    //% group="chart"
    //% inlineInputMode=external
    export function tft_draw_chart_data(column: number, name: string, num1: number, num2: number = null, num3: number = null, num4: number = null, num5: number = null) {
        verify_runtime();
        let arr = [column & 0xFF];
        let nums = [num1, num2, num3, num4, num5];
        for (let i = 0; i < 5; i++) {
            if (nums[i] != null) {
                arr.push(nums[i] >> 8 & 0xff);
                arr.push(nums[i] & 0xff);
            } else {
                arr.push(0);
                arr.push(0);
            }
        }
        for (let i = 0; i < name.length; i++) {
            arr.push(adjust_charcode(name.charCodeAt(i)));
        }
        arr.push(0);
        i2cCommandSend(CMD_DRAW_HISTOGRAM_DATA, arr)
    }

    export class PartInfo {
        public value: number;
        public name: string;
        public color: number;
        constructor(value: number, name: string, color: number) {
            this.name = name;
            this.value = value;
            this.color = color;
        }
    }

    //% blockHidden=1
    //% blockId=createPartInfo block="value %value label %name color %color"
    //% color.shadow="colorNumberPicker"
    export function createPartInfo(value: number, name: string, color: number): PartInfo {
        return new PartInfo(value, name, color);
    }

    //% blockId=pie block="draw pie chart|part1 %part1=createPartInfo||part2 %part2=createPartInfo|part3 %part3=createPartInfo|part4 %part4=createPartInfo|part5 %part5=createPartInfo| part6 %part6=createPartInfo|part7 %part7=createPartInfo|part8 %part8=createPartInfo|part9 %part9=createPartInfo|pie10 %part10=createPartInfo"
    //% expandableArgumentMode="enabled"
    //% weight=10
    //% group="chart"
    //% inlineInputMode=external
    export function draw_pie_chart(
        part1: PartInfo = null,
        part2: PartInfo = null,
        part3: PartInfo = null,
        part4: PartInfo = null,
        part5: PartInfo = null,
        part6: PartInfo = null,
        part7: PartInfo = null,
        part8: PartInfo = null,
        part9: PartInfo = null,
        part10: PartInfo = null) {
        verify_runtime();
        let part_cnt = 0;
        let arr = [0];
        let part_arr = [part1, part2, part3, part4, part5, part6, part7, part8, part9, part10];

        for (let i = 0; i < 10; i++) {
            if (part_arr[i] == null) {
                break;
            }
            arr.push(part_arr[i].value >> 8 & 0xff);
            arr.push(part_arr[i].value & 0xff);
            let len = part_arr[i].name.length;
            for (let j = 0; j < (len > 6 ? 3 : len); j++) {
                arr.push(adjust_charcode(part_arr[i].name.charCodeAt(j)));
            }
            if (len > 6) {
                arr.push(".".charCodeAt(0))
                arr.push(".".charCodeAt(0))
                arr.push(".".charCodeAt(0))
            }
            arr.push(0)
            arr.push(part_arr[i].color >> 16 & 0xff)
            arr.push(part_arr[i].color >> 8 & 0xff)
            arr.push(part_arr[i].color & 0xff)
            part_cnt++;
        }
        arr[0] = part_cnt;

        i2cCommandSend(CMD_DRAW_PIE_CHART, arr)
    }
}