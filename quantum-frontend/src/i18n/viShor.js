export const viShor = Object.fromEntries(`
Factor a number, then explore the gates, measurements and classical checks in your run.¦Phân tích một số thành thừa số, rồi khám phá các cổng, phép đo và kiểm tra cổ điển trong lần chạy.
Shor execution walkthrough¦Hướng dẫn từng bước chạy Shor
FOLLOW THE COMPUTATION¦THEO DÕI PHÉP TÍNH
Your run, one operation at a time¦Khám phá từng thao tác trong lần chạy
The simulation has finished. Explore its recorded operations below; playback does not run new measurements.¦Mô phỏng đã hoàn tất. Khám phá các thao tác đã ghi lại bên dưới; phát lại không thực hiện phép đo mới.
Step¦Bước
Playback controls¦Điều khiển phát lại
← Back¦← Quay lại
Play¦Phát
Pause¦Tạm dừng
Next step →¦Bước tiếp theo →
Replay¦Phát lại
Show full run¦Hiện toàn bộ lần chạy
Walkthrough progress¦Tiến độ hướng dẫn
Quantum operation¦Thao tác lượng tử
Classical operation¦Thao tác cổ điển
Attempt¦Lần thử
Register activity¦Hoạt động của thanh ghi
Counting register¦Thanh ghi đếm
Work register¦Thanh ghi làm việc
Highlighted qubits participate in the selected operation. These labels show register activity, not quantum state values.¦Các qubit được tô sáng tham gia thao tác đang chọn. Nhãn thể hiện hoạt động của thanh ghi, không phải giá trị trạng thái lượng tử.
Classical checks can find factors before a quantum circuit is needed.¦Các kiểm tra cổ điển có thể tìm được thừa số trước khi cần đến mạch lượng tử.
Executed circuit blocks¦Các khối mạch đã thực hiện
CIRCUIT OPERATION ORDER¦THỨ TỰ THAO TÁC TRÊN MẠCH
Inspect¦Xem chi tiết
gates / operations¦cổng / thao tác
calculations¦phép tính
Execution log¦Nhật ký thực thi
Recorded actions¦Các thao tác đã ghi lại
QUANTUM¦LƯỢNG TỬ
CLASSICAL¦CỔ ĐIỂN
Advance to reveal the next action.¦Chuyển bước để xem thao tác tiếp theo.
Measure¦Đo
Check the input¦Kiểm tra đầu vào
The input is prime¦Đầu vào là số nguyên tố
Even-number shortcut¦Cách tìm nhanh cho số chẵn
Choose a base and check its GCD¦Chọn cơ số và kiểm tra ước chung lớn nhất
GCD shortcut found factors¦Đã tìm được thừa số qua ước chung lớn nhất
Create two registers¦Tạo hai thanh ghi
Apply Hadamard gates¦Áp dụng các cổng Hadamard
Prepare the work value 1¦Chuẩn bị giá trị 1 cho thanh ghi làm việc
Controlled modular multiplication¦Phép nhân modulo có điều khiển
Apply inverse QFT¦Áp dụng QFT nghịch đảo
Swaps, controlled phase rotations and Hadamards use interference to make information about the period measurable in the counting register.¦Các phép hoán đổi, quay pha có điều khiển và cổng Hadamard dùng giao thoa để thông tin về chu kỳ có thể đo được trong thanh ghi đếm.
Measure the counting register¦Đo thanh ghi đếm
Zero sample: try again¦Mẫu đo bằng không: thử lại
The zero phase gives no useful period denominator. Start another attempt.¦Pha bằng không không cho mẫu số hữu ích để tìm chu kỳ. Bắt đầu lần thử khác.
Approximate the phase as a fraction¦Xấp xỉ pha bằng phân số
Check candidate multiples¦Kiểm tra các bội của ứng viên
No tested multiple returned 1; another attempt is needed.¦Không bội nào đã kiểm tra cho kết quả 1; cần thử lại.
Odd period: choose another base¦Chu kỳ lẻ: chọn cơ số khác
Use half the period¦Dùng một nửa chu kỳ
Unhelpful half-period value¦Giá trị nửa chu kỳ không hữu ích
Calculate both GCDs¦Tính cả hai ước chung lớn nhất
Trivial factor¦Thừa số tầm thường
The first GCD is 1 or N. Choose another base.¦Ước chung lớn nhất đầu tiên là 1 hoặc N. Chọn cơ số khác.
The second GCD is 1 or N. Choose another base.¦Ước chung lớn nhất thứ hai là 1 hoặc N. Chọn cơ số khác.
Factorization complete¦Đã phân tích thành thừa số
Attempt limit reached¦Đã đạt giới hạn số lần thử
`.trim().split('\n').map(line => line.split('¦')));

export const shorPatterns = [
 [/^Revisit (.+)$/, (_, title) => `Xem lại ${viShor[title] || title}`],
 [/^ · ATTEMPT (\d+)$/, (_, n) => ` · LẦN THỬ ${n}`],
 [/^· ATTEMPT (\d+)$/, (_, n) => `· LẦN THỬ ${n}`],
 [/^Test whether (\d+) is prime before attempting factorization\.$/, (_, n) => `Kiểm tra ${n} có phải số nguyên tố trước khi phân tích thành thừa số.`],
 [/^(\d+) has no nontrivial factors\. No quantum gates were used\.$/, (_, n) => `${n} không có thừa số ngoài 1 và chính nó. Không dùng cổng lượng tử nào.`],
 [/^(\d+) is even: (.+)\. No quantum gates were used\.$/, (_, n, eq) => `${n} là số chẵn: ${eq}. Không dùng cổng lượng tử nào.`],
 [/^Choose a = (\d+)\. (.+)\.$/, (_, a, eq) => `Chọn a = ${a}. ${eq}.`],
 [/^The base shares a factor with (\d+): (.+)\. This attempt needed no quantum gates\.$/, (_, n, eq) => `Cơ số có thừa số chung với ${n}: ${eq}. Lần thử này không cần cổng lượng tử.`],
 [/^Initialize (\d+) counting qubits and (\d+) work qubits to zero\.$/, (_, c, w) => `Khởi tạo ${c} qubit đếm và ${w} qubit làm việc về không.`],
 [/^The counting register now represents a superposition of (\d+) inputs\. These are amplitudes, not a list of readable answers\.$/, (_, n) => `Thanh ghi đếm biểu diễn chồng chập của ${n} đầu vào. Đây là các biên độ, không phải danh sách đáp án có thể đọc trực tiếp.`],
 [/^Apply X to q(\d+), the least significant work bit, to prepare \|1⟩\.$/, (_, q) => `Áp dụng X lên q${q}, bit có trọng số thấp nhất của thanh ghi làm việc, để chuẩn bị |1⟩.`],
 [/^Control q(\d+): multiply the work value by (\d+) modulo (\d+) when the control is 1\. This is (.+) for a = (\d+)\.$/, (_, q, m, n, eq, a) => `Điều khiển q${q}: nhân giá trị làm việc với ${m} theo modulo ${n} khi qubit điều khiển là 1. Đây là ${eq} với a = ${a}.`],
 [/^Observed (\d+) \(decimal (\d+)\)\. Dividing by (\d+) gives phase (.+)\. A sample suggests a period; it does not directly give the factors\.$/, (_, bits, d, scale, phase) => `Đo được ${bits} (thập phân ${d}). Chia cho ${scale} được pha ${phase}. Mẫu đo gợi ý chu kỳ, không trực tiếp cho thừa số.`],
 [/^(.+) ≈ (.+)\. Its denominator (\d+) is a candidate; a reduced fraction may hide part of the period\.$/, (_, phase, f, d) => `${phase} ≈ ${f}. Mẫu số ${d} là ứng viên; phân số tối giản có thể che mất một phần chu kỳ.`],
 [/^Found a verified period multiple r = (\d+)\.$/, (_, r) => `Đã xác minh một bội của chu kỳ r = ${r}.`],
 [/^r = (\d+) is odd\. Factor extraction requires an even period\.$/, (_, r) => `r = ${r} là số lẻ. Việc tìm thừa số cần chu kỳ chẵn.`],
 [/^r = (\d+) is even\. (.+)\. Use this value in the two GCD checks\.$/, (_, r, eq) => `r = ${r} là số chẵn. ${eq}. Dùng giá trị này trong hai phép kiểm tra ước chung lớn nhất.`],
 [/^The value is −1 modulo (\d+); the GCD checks would give trivial factors\. Choose another base\.$/, (_, n) => `Giá trị bằng −1 theo modulo ${n}; các phép kiểm tra sẽ cho thừa số tầm thường. Chọn cơ số khác.`],
 [/^No nontrivial factors were found in (\d+) attempts\. Try another run or more counting qubits\.$/, (_, n) => `Không tìm được thừa số ngoài 1 và chính số đó sau ${n} lần thử. Chạy lại hoặc dùng thêm qubit đếm.`],
];
