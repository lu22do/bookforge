"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextField = TextField;
exports.TextArea = TextArea;
exports.SelectField = SelectField;
exports.InfoRow = InfoRow;
const react_1 = __importDefault(require("react"));
function TextField({ label, value, onChange, placeholder }) {
    return (<label className="grid gap-1 text-sm">
      <span className="text-gray-600">{label}</span>
      <input className="rounded-md border px-3 py-2" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}/>
    </label>);
}
function TextArea({ label, value, onChange, placeholder }) {
    return (<label className="grid gap-1 text-sm">
      <span className="text-gray-600">{label}</span>
      <textarea className="min-h-[100px] rounded-md border px-3 py-2" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}/>
    </label>);
}
function SelectField({ label, value, onChange, options }) {
    return (<label className="grid gap-1 text-sm">
      <span className="text-gray-600">{label}</span>
      <select className="rounded-md border px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (<option key={o} value={o}>{o}</option>))}
      </select>
    </label>);
}
function InfoRow({ label, value }) {
    return (<div>
      <span className="mr-1 font-medium text-gray-700">{label}:</span>
      <span className="text-gray-700">{value}</span>
    </div>);
}
