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
    const CMD_IS_BUSY = 0xB0;

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
        //color RGB888位转RGB565
        let param = (((color >> 16) & 0xff) >> 3) << 11 |
            (((color >> 8) & 0xff) >> 2) << 5 |
            ((color & 0xff) >> 3);

        i2cCommandSend(CMD_SET_BACKGROUND_COLOR, [
            param >> 8 & 0xff,
            param & 0xff
        ]);
    }
    //% block="set draw pen color %color"
    //% color.shadow="colorNumberPicker"
    //% color.defl=0xffffff
    //% weight=95
    export function tft_set_pen_color(color: number) {
        verify_runtime();
        //color RGB888位转RGB565
        let param = (((color >> 16) & 0xff) >> 3) << 11 |
            (((color >> 8) & 0xff) >> 2) << 5 |
            ((color & 0xff) >> 3);
        i2cCommandSend(CMD_SET_PEN_COLOR, [
            param >> 8 & 0xff,
            param & 0xff
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
}