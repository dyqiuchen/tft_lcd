//% weight=100 color=#008C8C block="TFT LCD" blockId="TFTLCD" icon="\uf26c"
namespace TFTLCD {

    const St7789vAddr = 0x11;

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

    //% block="clear TFTLCD display"
    //% weight=3
    export function clear() {
        i2cCommandSend(0x10, [1]);
    }
    //% block="draw line from (%x0,%y0) to (%x1,%y1)"
    export function tft_draw_line(x0: number, y0: number, x1: number, y1: number) {

        i2cCommandSend(0x10, [
            x0 >> 8 & 0xff,
            x0 & 0x0f,
            y0 >> 8 & 0x0f,
            y0 & 0x0f,
            x1 >> 8 & 0x0f,
            x1 & 0x0f,
            y1 >> 8 & 0x0f,
            y1 & 0x0f
        ]);
    }
}