//% weight=100 color=#008C8C block="TFT LCD" blockId="TFT LCD" icon="\uf26c"
namespace TFTLCD {

    const St7789vAddr = 0x10;

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
}