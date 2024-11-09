//% weight=100 color=#008C8C block="TFT LCD" blockId="TFTLCD" icon="\uf26c"
namespace TFTLCD {

    const St7789vAddr = 0x11;

    // CMD list
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

    enum TFTLCD_BLK_CMD {
        //%block="blkopen"
        BlkOpen,
        //%block="blkclose"
        BlkClose,
    }

    /**
     * 校准运行时间,防止屏还未初始化就调用函数
     */
    function verify_runtime() {
        while (input.runningTime() < 500) {
            basic.pause(10);
        }
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
        pins.i2cWriteBuffer(St7789vAddr, buff);
    }

    /**
     * PS:运行时间少于500ms等待
     * 1. 背光开关
     * 2. 划线
     * 3. 绘制矩形（实心、空心）
     * 4. 绘制圆（不做积木块）
     * 5. 清屏（完成功能后需要delay100ms）
     * 6. 设置背景色
     * 7. 绘制画笔色
     * 8. 显示字符串
     * 9. 显示数字
     * 10. 换行；选择行（选择行如果存在字符，则选择覆盖）
     * 11. 清除指定行
     * 12. 显示进度条
     */

    //% block="backlight set %TFTLCD_BLK_CMD"
    //% weight=100
    export function tft_backlight_ctrl(cmd: TFTLCD_BLK_CMD) {
        verify_runtime();
        i2cCommandSend(CMD_SET_BACKLIGHT, [cmd == TFTLCD_BLK_CMD.Blk_open ? 0x01 : 0x00]);
    }
    
    //% block="draw line from %x0,%y0 to %x1,%y1"
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
        basic.pause(20);
    }
    //% block="draw rectange from %xs, %ys to %xe, %ye %fill"
    //% weight=98
    export function tft_draw_rect(xs: number, ys: number, xe: number, ye: number, fill: boolean) {
        verify_runtime();
        i2cCommandSend(CMD_DRAW_RECT, [
            fill ? 0x01 : 0x00,
            xs >> 8 & 0xff,
            xs & 0xff,
            ys >> 8 & 0xff,
            ys & 0xff,
            xe >> 8 & 0xff,
            xe & 0xff,
            ye >> 8 & 0xff,
            ye & 0xff
        ]);
        basic.pause(20);
    }
    //% block="set background clear screen"
    //% weight=97
    export function tft_clear_screen() {
        verify_runtime();
        i2cCommandSend(CMD_CLEAR_SCREEN, []);
        basic.pause(100);
    }
    //% block="set background color %color"
    //% color.shadow="colorNumberPicker"
    //% weight=96
    export function tft_set_background_color(color : number = 0) {
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
    //% block="set draw pen color %TFTLCD_COLOR"
    //% color.shadow="colorNumberPicker"
    //% weight=95
    export function tft_set_pen_color(color: number = 0xffffff) {
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
        for (let i = 0; i < str.length; i++) {
            i2cCommandSend(CMD_DRAW_STRING, [str.charCodeAt(i)]);
            basic.pause(10);
        }
    }

    //% block="show number %num"
    //% weight=93
    export function tft_show_num(num: number = 0) {
        let str = "" + num;
        tft_show_string(str);
    }
    //% block="Line breaks"
    //% weight=92
    export function tft_new_line() {
        i2cCommandSend(CMD_CHANGE_LINE, [0]);
        basic.pause(20);
    };
    //% block="Select the specified row %num"
    //% num.min=1 num.max=8
    //% weight=91
    export function tft_select_line(num: number = 1) {
        i2cCommandSend(CMD_CHANGE_LINE, [num]);
        basic.pause(20);
    };
    //% block="Clear the specified rows %num"
    //% num.min=1 num.max=8
    //% weight=90
    export function tft_clear_line(num: number = 1) {
        i2cCommandSend(CMD_CLEAR_LINE, [num]);
        basic.pause(30);
    };
    //% block="Show loading bar %percent"
    //% percent.min=0 percent.max=100
    //% weight=89
    export function tft_show_loading_bar(percent: number = 0) {
        i2cCommandSend(CMD_DRAW_PROGRESS, [percent]);
        basic.pause(20);
    };


    export function tft_draw_circle(x: number, y: number, r: number, fill: boolean) {
        verify_runtime();
        i2cCommandSend(CMD_DRAW_CIRCLE, [
            fill ? 0x01 : 0x00,
            x >> 8 & 0xff,
            x & 0xff,
            y >> 8 & 0xff,
            y & 0xff,
            r >> 8 & 0xff,
            r & 0xff
        ])
        basic.pause(20);
    }
}