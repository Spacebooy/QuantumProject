export const viGame=Object.fromEntries(`
Explored maze¦Mê cung đã khám phá
RESEARCH COMPLEX¦KHU NGHIÊN CỨU
Explored¦Đã khám phá
Unknown¦Chưa biết
Maze map, scroll to explore¦Bản đồ mê cung, cuộn để khám phá
A branching lab maze. Blue rooms have been visited. Question marks conceal unexplored rooms.¦Mê cung phòng thí nghiệm có nhiều nhánh. Phòng màu xanh đã được ghé thăm. Dấu hỏi che các phòng chưa khám phá.
HAZARD¦NGUY HIỂM
DEAD END¦NGÕ CỤT
DESTINATION¦ĐÍCH ĐẾN
START¦BẮT ĐẦU
UNKNOWN¦CHƯA BIẾT
YOU¦BẠN
UNEXPLORED / DESTINATION UNKNOWN¦CHƯA KHÁM PHÁ / CHƯA BIẾT ĐÍCH ĐẾN
rooms explored.¦phòng đã khám phá.
Safe does not mean closer to the exit.¦An toàn không có nghĩa là gần lối ra hơn.
← Backtrack¦← Quay lại
Guided scanner¦Máy quét có hướng dẫn
Use operation blocks and watch probabilities change.¦Dùng các khối thao tác và quan sát xác suất thay đổi.
Gate apprentice¦Làm quen với cổng
Prepare qubits with H gates; use Oracle and Diffusion blocks.¦Chuẩn bị qubit bằng cổng H; dùng khối đánh dấu và khuếch tán.
Circuit architect¦Thiết kế mạch nâng cao
Build preparation and diffusion from elementary gates. The oracle stays supplied.¦Tự ghép các cổng cơ bản để chuẩn bị trạng thái và khuếch tán. Khối đánh dấu được cung cấp sẵn.
A junction ahead. Count the corridors, then allocate your qubits.¦Phía trước có một ngã rẽ. Đếm số hành lang rồi chọn số qubit cần dùng.
Unused states are unmarked; measuring one leaves you here.¦Trạng thái không dùng đến sẽ không được đánh dấu; nếu đo trúng, bạn ở nguyên chỗ.
Every state maps to a corridor.¦Mỗi trạng thái tương ứng với một hành lang.
Circuit capacity reached (2,500 elementary gates). Undo or reset the scanner.¦Mạch đã đạt giới hạn 2.500 cổng cơ bản. Hãy hoàn tác hoặc đặt lại máy quét.
The oracle changed relative phases, not probabilities. It tests bomb safety; it does not know which route reaches the destination.¦Khối đánh dấu đổi pha tương đối, không đổi xác suất. Nó kiểm tra hành lang có bom hay không, chứ không biết đường nào dẫn đến đích.
Interference changed the state. Compare the bars: amplification can help, do nothing, or reduce success depending on the state and marked fraction.¦Giao thoa làm trạng thái thay đổi. So sánh các cột: khuếch đại có thể tăng, giữ nguyên hoặc giảm xác suất thành công tùy trạng thái và tỷ lệ được đánh dấu.
Circuit updated by the simulator. Compare the new probabilities with the previous state.¦Mạch đã được mô phỏng. So sánh xác suất mới với trạng thái trước đó.
A bomb used your last life. Mission ended.¦Bạn gặp bom và mất mạng cuối cùng. Nhiệm vụ kết thúc.
Bomb detected on arrival. You lose a life and retreat to the junction. The hazard is now marked.¦Bạn gặp bom khi đi vào. Bạn mất một mạng và quay về ngã rẽ. Chỗ nguy hiểm đã được đánh dấu.
Escape successful. You found the destination!¦Thoát thành công. Bạn đã tìm thấy đích đến!
Safe, but a dead end. Backtrack and use what you learned.¦An toàn nhưng là ngõ cụt. Hãy quay lại và dùng thông tin vừa khám phá.
A safe passage leads to another junction. Count its corridors and allocate a new scanner.¦Lối đi an toàn dẫn đến một ngã rẽ khác. Đếm hành lang rồi chọn lại số qubit.
Back at an explored junction. Known dead ends and hazards remain on the map. The hidden routes have not changed.¦Bạn trở lại ngã rẽ đã khám phá. Ngõ cụt và nguy hiểm đã biết vẫn được giữ trên bản đồ. Các đường ẩn không thay đổi.
Scanner reset to |0…0⟩. The map, lives, and cumulative action costs are unchanged.¦Máy quét đã về |0…0⟩. Bản đồ, số mạng và chi phí thao tác tích lũy không đổi.
Last circuit action removed. Cumulative oracle and energy costs are not refunded.¦Đã xóa thao tác cuối. Chi phí đánh dấu và năng lượng đã dùng không được hoàn lại.
Prepare a superposition to give every encoded state a chance. Unused states will also be included.¦Tạo chồng chập để mỗi trạng thái được mã hóa đều có cơ hội xuất hiện, kể cả trạng thái không dùng đến.
Try an H gate on each allocated qubit to prepare equal amplitudes.¦Thử đặt cổng H trên từng qubit để tạo các biên độ bằng nhau.
The safety oracle marks non-bomb corridors through relative phase, without revealing the destination.¦Khối đánh dấu an toàn dùng pha tương đối để đánh dấu hành lang không có bom, nhưng không tiết lộ đích đến.
Oracle marking alone leaves probabilities unchanged. Diffusion creates interference. With half the basis states marked, standard Grover rounds cannot improve the initial 50% marked probability. More rounds are not always better.¦Chỉ đánh dấu thì xác suất không đổi. Khuếch tán tạo giao thoa. Khi một nửa số trạng thái được đánh dấu, các vòng Grover chuẩn không làm xác suất ban đầu 50% tăng lên. Nhiều vòng hơn không phải lúc nào cũng tốt hơn.
← All missions¦← Tất cả nhiệm vụ
Quantum Path Finder¦Tìm đường lượng tử
Moves¦Số bước đi
New mission¦Nhiệm vụ mới
The quantum processor is calculating…¦Bộ mô phỏng lượng tử đang tính…
ACCESS TO THE OUTSIDE¦ĐÃ TÌM THẤY LỐI RA
SIGNAL LOST¦MẤT TÍN HIỆU
Escape successful.¦Thoát thành công.
Out of lives.¦Đã hết mạng.
moves ·¦bước đi ·
oracle calls ·¦lần đánh dấu ·
measurements ·¦lần đo ·
energy¦năng lượng
Choose another mission¦Chọn nhiệm vụ khác
A quiet dead end.¦Một ngõ cụt yên tĩnh.
No bomb here, but no way forward. Your explored route stays on the map.¦Ở đây không có bom nhưng không còn đường đi tiếp. Đường đã khám phá vẫn được giữ trên bản đồ.
Quantum scanner¦Máy quét lượng tử
QUANTUM SCANNER¦MÁY QUÉT LƯỢNG TỬ
corridors ahead¦hành lang phía trước
Choose how many qubits you need.¦Chọn số qubit bạn cần.
states¦trạng thái
Allocate scanner¦Khởi tạo máy quét
Change allocation¦Đổi số qubit
Hint¦Gợi ý
Undo¦Hoàn tác
Reset scanner¦Đặt lại máy quét
unused basis state¦trạng thái cơ sở không dùng đến
s¦
· probability¦· xác suất
%. Measuring one keeps you here. Extra qubits increase energy cost.¦%. Đo trúng một trạng thái như vậy sẽ khiến bạn ở nguyên chỗ. Dùng thêm qubit sẽ tốn thêm năng lượng.
Superposition¦Chồng chập
Apply H to every qubit¦Áp dụng H cho mọi qubit
Safety oracle¦Khối đánh dấu an toàn
Mark safe paths¦Đánh dấu đường an toàn
Flip the marked phases¦Đảo pha các trạng thái được đánh dấu
Diffusion¦Khuếch tán
Amplify¦Khuếch đại
Interfere the amplitudes¦Tạo giao thoa giữa các biên độ
Measure & move¦Đo và di chuyển
Commit to one corridor¦Đi vào một hành lang
Gate workbench¦Bàn thiết kế cổng
Gate¦Cổng
Target¦Đích
Control¦Điều khiển
Angle (rad)¦Góc (radian)
Apply gate¦Áp dụng cổng
OPERATION HISTORY¦LỊCH SỬ THAO TÁC
No operations yet¦Chưa có thao tác
 gates in circuit¦cổng trong mạch
Actual simulator · Ideal mode · q0 is the leftmost bit¦Kết quả mô phỏng thật · Chế độ lý tưởng · q0 là bit ngoài cùng bên trái
actions ·¦thao tác ·
QUANTUM MISSIONS¦NHIỆM VỤ LƯỢNG TỬ
A little uncertainty.¦Một chút bất định.
A way out.¦Một lối thoát.
Explore a branching research lab. Allocate qubits, search for safe corridors, and find the destination. Safe passages can still lead nowhere.¦Khám phá phòng thí nghiệm nhiều nhánh. Chọn số qubit, tìm hành lang an toàn và tìm đích đến. Đường an toàn vẫn có thể dẫn vào ngõ cụt.
Choose a learning mode¦Chọn chế độ học
beginner¦cơ bản
intermediate¦trung cấp
advanced¦nâng cao
✓ Escaped¦✓ Đã thoát
junctions · 2–¦ngã rẽ · 2–
choices · 3 lives¦lựa chọn · 3 mạng
Play mission ↗¦Chơi nhiệm vụ ↗
New maps are generated for each mission. Progress stays in this session. Quantum outcomes always come from your simulator.¦Mỗi nhiệm vụ tạo bản đồ mới. Tiến độ được giữ trong phiên này. Kết quả lượng tử luôn đến từ trình mô phỏng.
COMING SOON¦SẮP CÓ
Bomb Detector · Shor Challenge · Escape the Quantum Lab¦Dò bom · Thử thách Shor · Thoát phòng thí nghiệm lượng tử
Known hazard¦Nguy hiểm đã biết
Known dead end¦Ngõ cụt đã biết
Unexplored corridor¦Hành lang chưa khám phá
not encoded¦chưa được mã hóa
Quantum details & learning notes¦Chi tiết lượng tử và ghi chú học tập
The oracle is a supplied map-based safety test, not a quantum sensor discovering unknown data. It marks all real, non-bomb corridors, including dead ends. Padded states are never marked. The route to the destination remains unknown.¦Khối đánh dấu là phép kiểm tra an toàn dựa trên bản đồ có sẵn, không phải cảm biến lượng tử tìm dữ liệu chưa biết. Nó đánh dấu mọi hành lang thật không có bom, kể cả ngõ cụt. Trạng thái đệm không được đánh dấu. Đường đến đích vẫn chưa biết.
H on every qubit includes all 2ⁿ states. Standard diffusion can overshoot; with half the states marked it cannot improve the initial 50% success rate. Phases below are relative to the first nonzero amplitude, so irrelevant global phase is removed.¦Đặt H trên mọi qubit sẽ bao gồm cả 2ⁿ trạng thái. Khuếch tán chuẩn có thể vượt quá điểm tối ưu; khi một nửa số trạng thái được đánh dấu, nó không tăng được xác suất ban đầu 50%. Các pha dưới đây lấy biên độ khác 0 đầu tiên làm mốc, nên pha toàn cục không có ý nghĩa vật lý đã được loại bỏ.
Elementary diffusion recipe for¦Cách ghép các cổng khuếch tán cơ bản cho
Apply these gates in order. The recipe depends only on the register size, not on the hidden map. The oracle remains a supplied block.¦Áp dụng các cổng này theo thứ tự. Cách ghép chỉ phụ thuộc số qubit, không phụ thuộc bản đồ ẩn. Khối đánh dấu vẫn được cung cấp sẵn.
State¦Trạng thái
Amplitude¦Biên độ
Relative phase¦Pha tương đối
Undefined (zero amplitude)¦Không xác định (biên độ bằng 0)
Reading phases can identify marked safe corridors. It still does not tell you which safe corridor reaches the exit.¦Đọc pha có thể cho biết hành lang an toàn được đánh dấu. Nhưng bạn vẫn chưa biết hành lang nào dẫn đến lối ra.
First Light¦Ánh sáng đầu tiên
Learn to allocate qubits and scan a junction.¦Học cách chọn số qubit và quét một ngã rẽ.
The Silent Wing¦Khu nhà tĩnh lặng
More branches. A safe corridor may be a dead end.¦Nhiều nhánh hơn. Hành lang an toàn vẫn có thể là ngõ cụt.
Eight-Way Junction¦Ngã rẽ tám hướng
Up to eight corridors. Watch for unused states.¦Tối đa tám hành lang. Chú ý các trạng thái không dùng đến.
Interference Lab¦Phòng thí nghiệm giao thoa
Experiment with different numbers of safe paths.¦Thử nghiệm với số lượng đường an toàn khác nhau.
Final Passage¦Lối đi cuối cùng
Find your way out with a carefully built circuit.¦Tìm lối ra bằng một mạch được thiết kế cẩn thận.
Invalid phase oracle input¦Dữ liệu đầu vào của khối đánh dấu pha không hợp lệ
The simulator did not return a measurement for every qubit.¦Trình mô phỏng chưa trả kết quả đo cho mọi qubit.
The simulator response is missing its quantum state.¦Phản hồi mô phỏng thiếu trạng thái lượng tử.
The simulator returned an invalid quantum state.¦Trình mô phỏng trả về trạng thái lượng tử không hợp lệ.
The simulator returned an unnormalized state.¦Trình mô phỏng trả về trạng thái chưa được chuẩn hóa.
`.trim().split('\n').map(line=>{const i=line.indexOf('¦');return [line.slice(0,i).trim(),line.slice(i+1)];}));
