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
    const CMD_CHANGE_LINE = 0x31;
    const CMD_CLEAR_LINE = 0x71;
    const CMD_DRAW_PROGRESS = 0xA0;
    const CMD_DRAW_CIRCULAR_LOADER = 0xA1;
    const CMD_IS_BUSY = 0xB0;
    const CMD_DRAW_HISTOGRAM = 0xC0;
    const CMD_DRAW_HISTOGRAM_DATA = 0xC1;
    const CMD_DRAW_PIE_CHART = 0xC2;

    export enum BlkCmdEnum {
        //%block="open"
        BlkOpen,
        //%block="close"
        BlkClose,
    }
    export enum LineNumEnum {
        //% block="Line 1"
        Line_1 = 1,
        //% block="Line 2"
        Line_2 = 2,
        //% block="Line 3"
        Line_3 = 3,
        //% block="Line 4"
        Line_4 = 4,
        //% block="Line 5"
        Line_5 = 5,
        //% block="Line 6"
        Line_6 = 6,
        //% block="Line 7"
        Line_7 = 7,
        //% block="Line 8"
        Line_8 = 8
    }

    export enum DrawType {
        //% block="Histogram"
        Histogram = 0,
        //% block="Linechart"
        Linechart = 1
    }



    /**
     * 校准运行时间,防止屏还未初始化就调用函数
     */
    function verify_runtime() {
        //while(!pins.i2cReadNumber(TFT_I2C_ADDR, NumberFormat.Int8LE));

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

    //% block="backlight set %cmd"
    //% weight=100
    export function tftBacklightCtrl(cmd: BlkCmdEnum) {
        verify_runtime();
        i2cCommandSend(CMD_SET_BACKLIGHT, [cmd == BlkCmdEnum.BlkOpen ? 0x01 : 0x00]);
    }

    //% block="draw line from %xs,%ys to %xe,%ye"
    //% xs.defl=0
    //% ys.defl=0
    //% xe.defl=20
    //% ye.defl=20
    //% weight=99
    export function tft_draw_line(xs: number, ys: number, xe: number, ye: number) {

        verify_runtime();
        i2cCommandSend(CMD_DRAW_LINE, [
            xs >> 8 & 0xff,
            xs & 0xff,
            ys >> 8 & 0xff,
            ys & 0xff,
            xe >> 8 & 0xff,
            xe & 0xff,
            ye >> 8 & 0xff,
            ye & 0xff
        ]);
    }
    //% block="draw rectange from|xs:%xs|ys:%ys to |xe:%xe|ye:%ye|fill:%fill"
    //% xs.defl=0
    //% ys.defl=0
    //% xe.defl=20
    //% ye.defl=20
    //% fill.defl=false
    //% weight=98
    export function tft_draw_rect(xs: number, ys: number, xe: number, ye: number, fill: boolean) {
        verify_runtime();
        i2cCommandSend(CMD_DRAW_RECT, [
            xs >> 8 & 0xff,
            xs & 0xff,
            ys >> 8 & 0xff,
            ys & 0xff,
            xe >> 8 & 0xff,
            xe & 0xff,
            ye >> 8 & 0xff,
            ye & 0xff,
            fill ? 0x01 : 0x00
        ]);
    }
    //% block="set background clear screen"
    //% weight=97
    export function tft_clear_screen() {
        verify_runtime();
        i2cCommandSend(CMD_CLEAR_SCREEN, [0]);
    }
    //% block="set background color %color"
    //% color.shadow="colorNumberPicker"
    //% color.defl=0x000000
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
    //% color.shadow="colorNumberPicker"
    //% color.defl=0xffffff
    //% weight=95
    export function tft_set_pen_color(color: number) {
        verify_runtime();
        i2cCommandSend(CMD_SET_PEN_COLOR, [
            (color >> 16) & 0xff,
            (color >> 8) & 0xff,
            color & 0xff
        ]);
    }
    //% block="show string %str"
    //% weight=94
    export function tft_show_string(str: string) {
        let arr = [];
        for (let i = 0; i < str.length; i++) {
            verify_runtime();
            arr.push(str.charCodeAt(i));
        }
        arr.push(0);
        i2cCommandSend(CMD_DRAW_STRING, arr);
    }

    //% block="show number %num"
    //% num.defl=20
    //% weight=93
    export function tft_show_num(num: number) {
        let str = "" + num;
        tft_show_string(str);
    }
    //% block="Line breaks"
    //% weight=91
    export function tft_new_line() {
        verify_runtime();
        i2cCommandSend(CMD_CHANGE_LINE, [0]);
    };
    //% block="select the specified line %num and write string %str"
    //% weight=92
    export function tft_select_line_write_string(num: LineNumEnum, str: string) {
        verify_runtime();
        i2cCommandSend(CMD_CHANGE_LINE, [num]);
        tft_show_string(str);
    };

    //% block="select the specified line %num clear"
    //% weight=93
    export function tft_select_line_clear(num: LineNumEnum) {
        verify_runtime();
        tft_select_line_write_string(num, "");
    };

    //% block="select the specified line %num and write num %wnum"
    //% weight=90
    export function tft_select_line_write_num(num: LineNumEnum, wnum: number) {
        verify_runtime();
        i2cCommandSend(CMD_CHANGE_LINE, [num]);
        tft_show_num(wnum);
    };

    export function tft_clear_line(num: number) {
        verify_runtime();
        i2cCommandSend(CMD_CLEAR_LINE, [num]);
    };
    //% block="Show loading bar %percent"
    //% percent.defl=50
    //% percent.min=0 percent.max=100
    //% weight=89
    export function tft_show_loading_bar(percent: number) {
        verify_runtime();
        i2cCommandSend(CMD_DRAW_PROGRESS, [percent]);
    };

    //% block="draw circle from %x,%y with radius %r fill %fill"
    //% weight=98
    export function tft_draw_circle(x: number, y: number, r: number, fill: boolean) {
        verify_runtime();
        i2cCommandSend(CMD_DRAW_CIRCLE, [
            x >> 8 & 0xff,
            x & 0xff,
            y >> 8 & 0xff,
            y & 0xff,
            r >> 8 & 0xff,
            r & 0xff,
            fill ? 0x01 : 0x00
        ])
    }

    //% block="set TFT draw a circular loadercolor %color"
    //% color.shadow="colorNumberPicker"
    //% color.defl=0x000000
    //% weight=96
    export function tft_draw_circular_loader(color: number) {
        verify_runtime();
        //color RGB888位转RGB565
        i2cCommandSend(CMD_DRAW_CIRCULAR_LOADER, [
            color >> 16 & 0xff,
            color >> 8 & 0xff,
            color & 0xff
        ]);
    }

    //% block="draw %drawtype: | set Y min %ymin and Y max %ymax, |set column %column and group %group"
    //% weight=98
    //% ymin.defl=0
    //% ymin.min=-32767 ymin.max=32767
    //% ymax.defl=0
    //% ymax.min=-32767 ymax.max=32767
    //% column.defl=1
    //% column.min=1 column.max=10
    //% column.defl=1
    //% column.min=1 column.max=10
    //% group.defl=1
    //% group.min=1 group.max=5
    export function tft_draw_histogram(drawtype: DrawType, ymin: number, ymax: number, column: number, group: number) {
        verify_runtime();
        i2cCommandSend(CMD_DRAW_HISTOGRAM, [
            ymin >> 8 & 0xff,
            ymin & 0xff,
            ymax >> 8 & 0xff,
            ymax & 0xff,
            column & 0xff,
            group & 0xff,
            drawtype & 0xff
        ])
    }

    //% block="write histogram data: |set %column column name is %name| data1 = %num1|| data2 = %num2| data3 = %num3| data4 = %num4| data5 = %num5"
    //% expandableArgumentMode="enabled"
    //% weight=98
    //% column.defl=1
    //% column.min=1 column.max=10
    export function tft_draw_histogram_data(column: number, name: string, num1: number, num2: number = null, num3: number = null, num4: number = null, num5: number = null) {
        verify_runtime();
        let arr = [];
        arr.push(column & 0xff);
        arr.push(num1 >> 8 & 0xff);
        arr.push(num1 & 0xff);
        arr.push(num2 >> 8 & 0xff);
        arr.push(num2 & 0xff);
        arr.push(num3 >> 8 & 0xff);
        arr.push(num3 & 0xff);
        arr.push(num4 >> 8 & 0xff);
        arr.push(num4 & 0xff);
        arr.push(num5 >> 8 & 0xff);
        arr.push(num5 & 0xff);
        for (let i = 0; i < name.length; i++) {
            verify_runtime();
            arr.push(name.charCodeAt(i));
        }
        arr.push(0);
        i2cCommandSend(CMD_DRAW_HISTOGRAM_DATA, arr)
    }

    export class PartInfo {
        public value: number;
        public name: string;
        constructor(value: number, name: string) {
            this.name = name;
            this.value = value;
        }
    }
    
    //% blockHidden=1
    //% blockId=createPartInfo block="value %value label %name"
    export function createPartInfo(value: number, name: string): PartInfo{
        return new PartInfo(value, name);
    }

    //% blockId=pie block="draw pie chart: |part1 %part1=createPartInfo||part2 %part2=createPartInfo|part3 %part3=createPartInfo|part4 %part4=createPartInfo|part5 %part5=createPartInfo| part6 %part6=createPartInfo|part7 %part7=createPartInfo|part8 %part8=createPartInfo|part9 %part9=createPartInfo|pie10 %part10=createPartInfo"
    //% expandableArgumentMode="enabled"
    //% weight=98
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
        part10: PartInfo = null,
    ) {
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
            for (let i = 0; i < (len > 6 ? 3 : len); i++) {
                arr.push(part_arr[i].name.charCodeAt(i));
            }
            if (len > 6){
                arr.push(".".charCodeAt(0))
                arr.push(".".charCodeAt(0))
                arr.push(".".charCodeAt(0))
            }
            arr.push(0)
            part_cnt++;
        }
        arr[0] = part_cnt;
        i2cCommandSend(CMD_DRAW_PIE_CHART, arr)
    }
}