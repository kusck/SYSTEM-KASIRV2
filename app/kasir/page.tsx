'use client';

import { useMemo, useState } from 'react';
import { formatInputNumber, getErrorMessage, readJsonResponse, rupiah } from '@/lib/format';
import { buildEscPosReceipt, buildReceiptText, type ReceiptData } from '@/lib/thermalReceipt';
import {
  AlertTriangle,
  Banknote,
  Bluetooth,
  Calculator,
  CheckCircle2,
  Coins,
  CreditCard,
  Printer,
  PrinterCheck,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Usb,
  UserRound,
  Wallet,
} from 'lucide-react';

const cashierOptions = ['IBU YUNINGSIH', 'KARYAWAN'];
const quickAmounts = [50000, 100000, 150000, 200000];

const BLUETOOTH_SERVICE_UUIDS = [
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '0000ffe0-0000-1000-8000-00805f9b34fb',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
];

const BLUETOOTH_CHARACTERISTIC_UUIDS = [
  '0000ff01-0000-1000-8000-00805f9b34fb',
  '0000ff02-0000-1000-8000-00805f9b34fb',
  '0000ffe1-0000-1000-8000-00805f9b34fb',
  '49535343-8841-43f4-a8d4-ecbe34729bb3',
];

type TransactionResponse = {
  transaction?: {
    invoiceNo: string;
    total: number;
    paidAmount: number;
    change: number;
    cashierName: string;
    createdAt: string;
  };
};

type BluetoothCharacteristicLike = {
  properties?: {
    write?: boolean;
    writeWithoutResponse?: boolean;
  };
  writeValue?: (value: Uint8Array) => Promise<void>;
  writeValueWithoutResponse?: (value: Uint8Array) => Promise<void>;
};

type BluetoothServiceLike = {
  getCharacteristic: (characteristic: string) => Promise<BluetoothCharacteristicLike>;
  getCharacteristics?: () => Promise<BluetoothCharacteristicLike[]>;
};

type BluetoothDeviceLike = {
  name?: string;
  gatt?: {
    connect: () => Promise<{
      getPrimaryService: (service: string) => Promise<BluetoothServiceLike>;
    }>;
  };
};

type BluetoothNavigator = Navigator & {
  bluetooth?: {
    requestDevice: (options: {
      acceptAllDevices: boolean;
      optionalServices: string[];
    }) => Promise<BluetoothDeviceLike>;
  };
};

type UsbEndpointLike = {
  endpointNumber: number;
  direction: 'in' | 'out';
};

type UsbAlternateLike = {
  interfaceClass?: number;
  endpoints: UsbEndpointLike[];
};

type UsbInterfaceLike = {
  interfaceNumber: number;
  alternates: UsbAlternateLike[];
};

type UsbConfigurationLike = {
  configurationValue: number;
  interfaces: UsbInterfaceLike[];
};

type UsbDeviceLike = {
  opened: boolean;
  productName?: string;
  configuration?: UsbConfigurationLike | null;
  configurations: UsbConfigurationLike[];
  open: () => Promise<void>;
  selectConfiguration: (configurationValue: number) => Promise<void>;
  claimInterface: (interfaceNumber: number) => Promise<void>;
  transferOut: (endpointNumber: number, data: Uint8Array) => Promise<unknown>;
};

type UsbNavigator = Navigator & {
  usb?: {
    requestDevice: (options: { filters: { classCode: number }[] }) => Promise<UsbDeviceLike>;
  };
};

type UsbPrinterConnection = {
  device: UsbDeviceLike;
  endpointNumber: number;
  interfaceNumber: number;
  name: string;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function byteChunks(bytes: Uint8Array, chunkSize: number) {
  const chunks: Uint8Array[] = [];
  for (let index = 0; index < bytes.length; index += chunkSize) {
    chunks.push(bytes.slice(index, index + chunkSize));
  }
  return chunks;
}

export default function KasirPage() {
  const [total, setTotal] = useState('');
  const [paid, setPaid] = useState('');
  const [cashier, setCashier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [printMessage, setPrintMessage] = useState('');
  const [printerBusy, setPrinterBusy] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<ReceiptData | null>(null);
  const [bluetoothCharacteristic, setBluetoothCharacteristic] = useState<BluetoothCharacteristicLike | null>(null);
  const [bluetoothPrinterName, setBluetoothPrinterName] = useState('');
  const [usbConnection, setUsbConnection] = useState<UsbPrinterConnection | null>(null);

  const totalNumber = Number(total || 0);
  const paidNumber = Number(paid || 0);
  const change = useMemo(() => Math.max(paidNumber - totalNumber, 0), [paidNumber, totalNumber]);
  const kurang = paidNumber > 0 && paidNumber < totalNumber;
  const isSuccess = message.toLowerCase().includes('berhasil');
  const isPrintError = ['gagal', 'tidak', 'error'].some((word) => printMessage.toLowerCase().includes(word));
  const activeReceipt = useMemo<ReceiptData | null>(() => {
    if (lastReceipt) return lastReceipt;
    if (totalNumber <= 0 || paidNumber <= 0) return null;

    return {
      invoiceNo: 'DRAFT',
      cashierName: cashier || 'Kasir',
      total: totalNumber,
      paidAmount: paidNumber,
      change,
      createdAt: new Date().toISOString(),
    };
  }, [cashier, change, lastReceipt, paidNumber, totalNumber]);

  function clearPrintStateForNewInput() {
    setLastReceipt(null);
    setPrintMessage('');
  }

  function getReceiptForPrint() {
    if (!activeReceipt) {
      setPrintMessage('Isi transaksi terlebih dahulu sebelum mencetak struk.');
      return null;
    }

    setLastReceipt(activeReceipt);
    return activeReceipt;
  }

  async function submit() {
    setMessage('');
    if (!cashier) {
      setMessage('Pilih nama kasir terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total: totalNumber, paidAmount: paidNumber, cashierName: cashier }),
      });
      const data = await readJsonResponse<TransactionResponse & { message?: string }>(res);
      if (!res.ok) throw new Error(data?.message || 'Gagal menyimpan transaksi');

      const transaction = data?.transaction;
      setLastReceipt({
        invoiceNo: transaction?.invoiceNo || `TRX-${Date.now()}`,
        cashierName: transaction?.cashierName || cashier,
        total: transaction?.total ?? totalNumber,
        paidAmount: transaction?.paidAmount ?? paidNumber,
        change: transaction?.change ?? change,
        createdAt: transaction?.createdAt || new Date().toISOString(),
      });
      setMessage('Pembayaran berhasil. Transaksi otomatis masuk ke Buku Kas sebagai Uang Masuk.');
      setPrintMessage('Struk siap dicetak.');
      setTotal('');
      setPaid('');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Terjadi error'));
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setTotal('');
    setPaid('');
    setCashier('');
    setMessage('');
    setPrintMessage('');
    setLastReceipt(null);
  }

  async function findWritableBluetoothCharacteristic(device: BluetoothDeviceLike) {
    const server = await device.gatt?.connect();
    if (!server) throw new Error('Printer Bluetooth tidak menyediakan koneksi GATT.');

    for (const serviceUuid of BLUETOOTH_SERVICE_UUIDS) {
      const service = await server.getPrimaryService(serviceUuid).catch(() => null);
      if (!service) continue;

      for (const characteristicUuid of BLUETOOTH_CHARACTERISTIC_UUIDS) {
        const characteristic = await service.getCharacteristic(characteristicUuid).catch(() => null);
        if (characteristic) return characteristic;
      }

      const characteristics = await service.getCharacteristics?.().catch(() => []);
      const writable = characteristics?.find((characteristic) => (
        characteristic.properties?.write || characteristic.properties?.writeWithoutResponse
      ));
      if (writable) return writable;
    }

    throw new Error('Printer Bluetooth terpilih belum cocok dengan service ESC/POS umum.');
  }

  async function connectBluetoothPrinter() {
    const bluetooth = (navigator as BluetoothNavigator).bluetooth;
    if (!bluetooth) {
      throw new Error('Web Bluetooth tidak didukung browser ini.');
    }

    const device = await bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: BLUETOOTH_SERVICE_UUIDS,
    });
    const characteristic = await findWritableBluetoothCharacteristic(device);

    setBluetoothCharacteristic(characteristic);
    setBluetoothPrinterName(device.name || 'Bluetooth Printer');
    setPrintMessage(`Bluetooth terhubung: ${device.name || 'Thermal Printer'}`);

    return characteristic;
  }

  async function writeBluetoothReceipt(characteristic: BluetoothCharacteristicLike, receipt: ReceiptData) {
    const bytes = buildEscPosReceipt(receipt);
    for (const chunk of byteChunks(bytes, 20)) {
      if (characteristic.writeValueWithoutResponse) {
        await characteristic.writeValueWithoutResponse(chunk);
      } else if (characteristic.writeValue) {
        await characteristic.writeValue(chunk);
      } else {
        throw new Error('Characteristic Bluetooth tidak bisa menerima data print.');
      }
      await delay(18);
    }
  }

  async function printBluetoothReceipt() {
    const receipt = getReceiptForPrint();
    if (!receipt) return;

    setPrinterBusy(true);
    try {
      const characteristic = bluetoothCharacteristic || (await connectBluetoothPrinter());
      await writeBluetoothReceipt(characteristic, receipt);
      setPrintMessage('Struk terkirim ke printer Bluetooth.');
    } catch (error) {
      setPrintMessage(getErrorMessage(error, 'Gagal mencetak via Bluetooth.'));
    } finally {
      setPrinterBusy(false);
    }
  }

  function findUsbOutputEndpoint(device: UsbDeviceLike) {
    const configuration = device.configuration || device.configurations[0];
    for (const usbInterface of configuration.interfaces) {
      for (const alternate of usbInterface.alternates) {
        const endpoint = alternate.endpoints.find((item) => item.direction === 'out');
        if (endpoint) {
          return {
            endpointNumber: endpoint.endpointNumber,
            interfaceNumber: usbInterface.interfaceNumber,
          };
        }
      }
    }

    throw new Error('Endpoint output USB printer tidak ditemukan.');
  }

  async function connectUsbPrinter() {
    const usb = (navigator as UsbNavigator).usb;
    if (!usb) {
      throw new Error('WebUSB tidak didukung browser ini.');
    }

    const device = await usb.requestDevice({ filters: [{ classCode: 7 }] });
    if (!device.opened) await device.open();
    if (!device.configuration) {
      await device.selectConfiguration(device.configurations[0]?.configurationValue || 1);
    }

    const endpoint = findUsbOutputEndpoint(device);
    await device.claimInterface(endpoint.interfaceNumber);

    const connection = {
      device,
      endpointNumber: endpoint.endpointNumber,
      interfaceNumber: endpoint.interfaceNumber,
      name: device.productName || 'USB Printer',
    };

    setUsbConnection(connection);
    setPrintMessage(`USB terhubung: ${connection.name}`);

    return connection;
  }

  async function printUsbReceipt() {
    const receipt = getReceiptForPrint();
    if (!receipt) return;

    setPrinterBusy(true);
    try {
      const connection = usbConnection || (await connectUsbPrinter());
      const bytes = buildEscPosReceipt(receipt);
      for (const chunk of byteChunks(bytes, 512)) {
        await connection.device.transferOut(connection.endpointNumber, chunk);
        await delay(8);
      }
      setPrintMessage('Struk terkirim ke printer USB.');
    } catch (error) {
      setPrintMessage(getErrorMessage(error, 'Gagal mencetak via USB.'));
    } finally {
      setPrinterBusy(false);
    }
  }

  function printBrowserReceipt() {
    const receipt = getReceiptForPrint();
    if (!receipt) return;

    setPrintMessage('Membuka cetak 58mm.');
    window.setTimeout(() => window.print(), 50);
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow"><Calculator size={14} /> Mesin Kasir</span>
          <h1>Transaksi cepat dan akurat</h1>
          <p>Input total belanja, uang tunai diterima, lalu sistem menghitung kembalian secara real-time.</p>
        </div>
      </div>

      <div className="cashier-grid">
        <section className="section-card">
          <div className="toolbar">
            <div className="section-heading">
              <span className="section-heading-icon"><ReceiptText size={20} /></span>
              <div className="section-title">
                <h2>Input Pembayaran</h2>
                <p>Dirancang untuk kasir yang butuh gerak cepat.</p>
              </div>
            </div>
          </div>

          <div className="form-stack">
            <label className="field">
              <span className="field-label"><UserRound size={14} /> Nama Kasir</span>
              <div className="input-shell">
                <span className="input-icon"><UserRound size={17} /></span>
                <select
                  className="select"
                  value={cashier}
                  onChange={(event) => {
                    setCashier(event.target.value);
                    clearPrintStateForNewInput();
                  }}
                >
                  <option value="">Pilih kasir yang melayani</option>
                  {cashierOptions.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </label>

            <label className="field">
              <span className="field-label"><ReceiptText size={14} /> Total Penjualan Belanja</span>
              <div className="input-shell has-prefix">
                <span className="input-prefix">Rp</span>
                <input
                  className="input big-money-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={formatInputNumber(total)}
                  onChange={(event) => {
                    setTotal(onlyDigits(event.target.value));
                    clearPrintStateForNewInput();
                  }}
                  placeholder="0"
                />
              </div>
            </label>

            <label className="field">
              <span className="field-label"><Banknote size={14} /> Jumlah Uang Dibayar</span>
              <div className="input-shell has-prefix">
                <span className="input-prefix">Rp</span>
                <input
                  className="input big-money-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={formatInputNumber(paid)}
                  onChange={(event) => {
                    setPaid(onlyDigits(event.target.value));
                    clearPrintStateForNewInput();
                  }}
                  placeholder="0"
                />
              </div>
            </label>

            <div className="quick-cash" aria-label="Nominal cepat">
              <button
                type="button"
                onClick={() => {
                  setPaid(String(totalNumber));
                  clearPrintStateForNewInput();
                }}
                disabled={totalNumber <= 0}
              >
                Bayar Pas
              </button>
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setPaid(String(amount));
                    clearPrintStateForNewInput();
                  }}
                >
                  {rupiah(amount)}
                </button>
              ))}
            </div>

            {kurang && (
              <div className="toast error">
                <AlertTriangle size={17} />
                Uang tunai yang dibayarkan kurang dari total belanja.
              </div>
            )}
          </div>

          <div className="button-row" style={{ marginTop: 22, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              disabled={loading || kurang || totalNumber <= 0 || paidNumber <= 0}
              onClick={submit}
              className="btn btn-primary btn-mobile-full"
            >
              {loading ? <span className="button-spinner spinner" /> : <CreditCard size={17} />}
              {loading ? 'Menyimpan...' : 'Bayar Sekarang'}
            </button>
            <button type="button" onClick={printBrowserReceipt} className="btn btn-secondary btn-mobile-full" disabled={!activeReceipt}>
              <Printer size={17} />
              Cetak
            </button>
            <button type="button" onClick={reset} className="btn btn-ghost btn-mobile-full">
              <RotateCcw size={17} />
              Reset
            </button>
          </div>

          {message && (
            <div className={`toast ${isSuccess ? 'success' : 'error'}`} style={{ marginTop: 14 }}>
              {isSuccess ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
              {message}
            </div>
          )}
        </section>

        <aside className="section-card payment-summary">
          <div className="section-heading">
            <span className="section-heading-icon"><ShieldCheck size={20} /></span>
            <div className="section-title">
              <h2>Ringkasan Pembayaran</h2>
              <p>Detail struk sebelum transaksi disimpan.</p>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div className="receipt-line">
              <span>Kasir</span>
              <strong>{cashier || 'Belum dipilih'}</strong>
            </div>
            <div className="receipt-line">
              <span>Total Belanja</span>
              <strong>{rupiah(totalNumber)}</strong>
            </div>
            <div className="receipt-line">
              <span>Uang Diterima</span>
              <strong>{rupiah(paidNumber)}</strong>
            </div>
            <div className="receipt-line">
              <span>Status</span>
              <strong style={{ color: kurang ? '#dc2626' : '#047857' }}>
                {kurang ? 'Kurang Bayar' : paidNumber > 0 ? 'Siap Diproses' : 'Menunggu Input'}
              </strong>
            </div>
          </div>

          <div className="change-card">
            <span><Coins size={14} /> Uang Kembalian</span>
            <strong>{rupiah(change)}</strong>
          </div>

          <div className="surface-card" style={{ marginTop: 16, padding: 16, boxShadow: 'none' }}>
            <div className="mobile-data-row">
              <span>Metode</span>
              <strong>Tunai</strong>
            </div>
            <div className="mobile-data-row" style={{ marginTop: 10 }}>
              <span>Pencatatan</span>
              <strong>Otomatis ke Buku Kas</strong>
            </div>
            <div className="mobile-data-row" style={{ marginTop: 10 }}>
              <span>Saldo</span>
              <strong><Wallet size={13} style={{ display: 'inline', marginRight: 4 }} /> Masuk</strong>
            </div>
          </div>

          <div className="thermal-print-panel">
            <div className="section-heading">
              <span className="section-heading-icon"><PrinterCheck size={20} /></span>
              <div className="section-title">
                <h2>Struk Thermal 58mm</h2>
                <p>{lastReceipt ? lastReceipt.invoiceNo : activeReceipt ? 'Pratinjau transaksi' : 'Menunggu transaksi'}</p>
              </div>
            </div>

            <div className="thermal-actions">
              <button className="btn btn-secondary" type="button" onClick={printBrowserReceipt} disabled={!activeReceipt || printerBusy}>
                <Printer size={16} />
                Browser 58mm
              </button>
              <button className="btn btn-ghost" type="button" onClick={printBluetoothReceipt} disabled={!activeReceipt || printerBusy}>
                {printerBusy ? <span className="button-spinner spinner" /> : <Bluetooth size={16} />}
                Bluetooth
              </button>
              <button className="btn btn-ghost" type="button" onClick={printUsbReceipt} disabled={!activeReceipt || printerBusy}>
                {printerBusy ? <span className="button-spinner spinner" /> : <Usb size={16} />}
                USB
              </button>
            </div>

            <div className="printer-status-grid">
              <span><Bluetooth size={13} /> {bluetoothPrinterName || 'Bluetooth belum terhubung'}</span>
              <span><Usb size={13} /> {usbConnection?.name || 'USB belum terhubung'}</span>
            </div>

            {printMessage && (
              <div className={`toast ${isPrintError ? 'error' : 'success'}`}>
                {isPrintError ? <AlertTriangle size={17} /> : <CheckCircle2 size={17} />}
                {printMessage}
              </div>
            )}
          </div>
        </aside>
      </div>

      <ReceiptPrintArea receipt={activeReceipt} />
    </div>
  );
}

function ReceiptPrintArea({ receipt }: { receipt: ReceiptData | null }) {
  if (!receipt) return null;

  return (
    <div className="receipt-print-area" aria-hidden="true">
      <pre>{buildReceiptText(receipt)}</pre>
    </div>
  );
}
