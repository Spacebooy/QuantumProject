import { viShor, shorPatterns } from './viShor.js';
import { vi } from './vi.js';
import { viGame } from './viGame.js';
import { viTutorial } from './viTutorial.js';
import { viInterface } from './viInterface.js';
export const catalog={...vi,...viGame,...viTutorial,...viInterface,...viShor};
const patterns=[
 ...shorPatterns,
 [/^Invalid (target|control) qubit: (.+)$/,(_,kind,n)=>`Qubit ${kind==='target'?'đích':'điều khiển'} không hợp lệ: ${n}`],
 [/^Unknown gate: (.+)$/,(_,g)=>`Cổng không được hỗ trợ: ${g}`],
 [/^Set Qubits to (\d+)\.$/,(_,n)=>`Đặt số qubit là ${n}.`],
 [/^Choose (.+) in the Mode control\.$/,(_,m)=>`Chọn ${translate(m,'vi')} trong mục Chế độ.`],
 [/^Choose (.+)$/,(_,m)=>`Chọn ${translate(m,'vi')}`],
 [/^Click this (.+) gate to remove it\. Then we’ll try again\.$/,(_,g)=>`Nhấp cổng ${translate(g,'vi')} này để xóa. Sau đó thử lại.`],
 [/^Click (.+) in the gate library\. A gate is an instruction we add to the circuit\.$/,(_,g)=>`Nhấp ${translate(g,'vi')} trong thư viện cổng. Cổng là một thao tác ta thêm vào mạch.`],
 [/^Set the angle to ([\d.]+) radians \((.+)\)\.$/,(_,n,turn)=>`Đặt góc ${n} radian (${turn==='a quarter turn'?'một phần tư vòng':'một phần tám vòng'}).`],
 [/^Choose q(\d+) as the target\. This is the qubit CNOT may flip\.$/,(_,n)=>`Chọn q${n} làm đích. Đây là qubit mà CNOT có thể đảo.`],
 [/^Click this square on q(\d+), the control wire\. The linked square on q(\d+) is the target\.$/,(_,a,b)=>`Nhấp ô này trên q${a}, dây điều khiển. Ô được nối trên q${b} là đích.`],
 [/^Click the glowing square on q(\d+) \(the (.+) wire\) to place (.+)\.$/,(_,n,w,g)=>`Nhấp ô sáng trên q${n} (dây ${w==='top'?'trên cùng':'thứ hai'}) để đặt ${translate(g,'vi')}.`],
 [/^(Remove|Place) (.+) at q(\d+), step (\d+)$/,(_,a,g,q,s)=>`${a==='Remove'?'Xóa':'Đặt'} ${translate(g,'vi')} tại q${q}, bước ${s}`],
 [/^Place (.+)$/,(_,g)=>`Đặt ${translate(g,'vi')}`],
 [/^About (.+)$/,(_,g)=>`Tìm hiểu ${translate(g,'vi')}`],
 [/^Switch to (dark|light) mode$/,(_,m)=>`Chuyển sang giao diện ${m==='dark'?'tối':'sáng'}`],
 [/^(\d+)\/(\d+) steps( · skipped steps)?$/,(_,a,b,s)=>`${a}/${b} bước${s?' · có bước đã bỏ qua':''}`],
 [/^· (.+) · (\d+\/\d+)$/,(_,title,n)=>`· ${translate(title,'vi')} · ${n}`],
 [/^Qubit Bot, (.+)$/,(_,m)=>`Robot Qubit, ${{neutral:'bình thường',happy:'vui vẻ',thinking:'đang suy nghĩ',hint:'gợi ý',success:'thành công',warning:'chú ý'}[m]||m}`],
 [/^(\d+) lives remaining$/,(_,n)=>`Còn ${n} mạng`],
 [/^(\d+) out of 3 stars$/,(_,n)=>`${n} trên 3 sao`],
 [/^JUNCTION (.+)$/,(_,n)=>`GIAO ĐIỂM ${n}`],
 [/^Previously (.+)%$/,(_,n)=>`Trước đó ${n}%`],
 [/^Measured (.+?) (\|[01]+⟩)\. (.*)$/,(_,a,b,s)=>`Đo được ${a} ${b}. ${translate(s,'vi')}`],
 [/^Measured (\|[01]+⟩): an unused state\. No corridor exists, so you stay here\. Reallocate and try again; no life lost\.$/,(_,b)=>`Đo được ${b}: trạng thái không dùng. Không có hành lang tương ứng nên bạn ở nguyên chỗ. Phân bổ lại rồi thử tiếp; không mất mạng.`],
 [/^Each qubit doubles your capacity\. Find the smallest n for which 2ⁿ ≥ (\d+); (\d+) qubits are enough here\.$/,(_,a,b)=>`Mỗi qubit tăng gấp đôi số trạng thái. Tìm n nhỏ nhất sao cho 2ⁿ ≥ ${a}; ở đây chỉ cần ${b} qubit.`],
 [/^(\d+) qubits? encode (\d+) states, but this junction has (\d+) corridors\. You need at least (\d+)\.$/,(_,a,b,c,d)=>`${a} qubit mã hóa ${b} trạng thái, nhưng giao điểm này có ${c} hành lang. Bạn cần ít nhất ${d} qubit.`],
 [/^(\d+) qubits allocated: (\d+) basis states for (\d+) corridors\. (.*)$/,(_,a,b,c,s)=>`Đã phân bổ ${a} qubit: ${b} trạng thái cơ sở cho ${c} hành lang. ${translate(s,'vi')}`],
 [/^Scanner unavailable: (.*?)\. Check that the FastAPI simulator is running on port 8000, then retry\. Your position and circuit have been kept\.$/,(_,e)=>`Máy quét chưa sẵn sàng: ${translate(e,'vi')}. Kiểm tra trình mô phỏng FastAPI đang chạy trên cổng 8000 rồi thử lại. Vị trí và mạch của bạn đã được giữ nguyên.`],
 [/^(Simulation error|Shor execution failed) \((\d+)\)$/,(_,s,n)=>`${s==='Simulation error'?'Lỗi mô phỏng':'Chạy Shor thất bại'} (${n})`],
 [/^(\d+) is prime\. No nontrivial factors exist\.$/,(_,n)=>`${n} là số nguyên tố. Không có thừa số nào ngoài 1 và chính nó.`],
 [/^\((\d+) and (\d+)\)$/,(_,a,b)=>`(${a} và ${b})`],
];
export function translate(value,language='en') {
 if(language!=='vi'||typeof value!=='string'||!value.trim())return value;
 const text=value.trim().replace(/\s+/g,' ');
 let result=catalog[text];
 if(result===undefined)for(const [re,fn] of patterns){const match=text.match(re);if(match){result=fn(...match);break;}}
 if(result===undefined)return value;
 return value.slice(0,value.length-value.trimStart().length)+result+value.slice(value.trimEnd().length);
}
