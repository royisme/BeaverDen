import { machineIdSync } from 'node-machine-id';
import si from 'systeminformation';
import os from 'os';
import { networkInterfaces } from 'os';

export interface DeviceInfo {
    deviceId: string;
    deviceName: string;
    os: string;
    deviceType?: string;
    model?: string;
    manufacturer?: string;
    ip?: string;
}

export async function getFullDeviceInfo(): Promise<DeviceInfo> {
    const deviceInfo: DeviceInfo = {
        deviceId: '',
        deviceName: '',
        os: '',
    };

    // 获取稳定的设备 ID
    deviceInfo.deviceId = machineIdSync();

    // 获取设备名称
    deviceInfo.deviceName = os.hostname();

    // 获取操作系统信息
    deviceInfo.os = `${os.platform()} ${os.release()}`; // 例如 "win32 10.0.19044"

    // 获取设备类型（简单判断，可根据业务需求扩展）
    const platform = os.platform();
    deviceInfo.deviceType = platform === 'win32' || platform === 'darwin' ? 'Desktop' : 'Mobile';

    // 获取 IP 地址
    const nets = networkInterfaces();
    deviceInfo.ip = 'Unknown IP';
    for (const name of Object.keys(nets)) {
        for (const net of nets[name] || []) {
            if (net.family === 'IPv4' && !net.internal) {
                deviceInfo.ip = net.address;
                break;
            }
        }
    }

    // 获取系统的其他信息（异步）
    try {
        const systemInfo = await si.system();
        deviceInfo.model = systemInfo.model || 'Unknown Model';
        deviceInfo.manufacturer = systemInfo.manufacturer || 'Unknown Manufacturer';
    } catch (error) {
        console.error('Failed to get system information:', error);
    }
    return deviceInfo;
}