export const viGameTraining = Object.fromEntries(`
Training mission¦Nhiệm vụ luyện tập
Training guide¦Hướng dẫn luyện tập
Training progress¦Tiến độ luyện tập
LEARN BY PLAYING¦HỌC QUA TRÒ CHƠI
Skip tutorial¦Bỏ qua hướng dẫn
Play first mission¦Chơi nhiệm vụ đầu tiên
Replay tutorial¦Chơi lại hướng dẫn
Start tutorial¦Bắt đầu hướng dẫn
START HERE¦BẮT ĐẦU TẠI ĐÂY
Training mission — learn to play¦Nhiệm vụ luyện tập — học cách chơi
Practice the scanner in six actions, then learn why a safe path can still be a dead end.¦Luyện dùng máy quét qua sáu thao tác và tìm hiểu vì sao đường an toàn vẫn có thể là ngõ cụt.
Tutorial completed¦Đã hoàn thành hướng dẫn
For this practice room, choose 2 qubits to encode all four corridors.¦Trong phòng luyện tập này, chọn 2 qubit để mã hóa cả bốn hành lang.
Encode the four corridors¦Mã hóa bốn hành lang
Choose 2 qubits, then Allocate scanner. Two qubits encode four paths: A = |00⟩, B = |01⟩, C = |10⟩, D = |11⟩. q0 is the leftmost bit.¦Chọn 2 qubit, rồi nhấn Cấp phát máy quét. Hai qubit mã hóa bốn đường: A = |00⟩, B = |01⟩, C = |10⟩, D = |11⟩. q0 là bit ngoài cùng bên trái.
Give each path a chance¦Cho mỗi đường một cơ hội
Click Superposition. Applying H to both qubits gives each corridor a 25% measurement probability. Watch the bars change.¦Nhấn Chồng chập. Áp dụng H lên cả hai qubit cho mỗi hành lang xác suất đo 25%. Quan sát các cột thay đổi.
Mark safety with phase¦Đánh dấu an toàn bằng pha
The bars now show equal chances. Click Mark safe paths: the oracle changes the phase of the safe path. Its probability will stay the same until we use interference.¦Các cột hiện có xác suất bằng nhau. Nhấn Đánh dấu đường an toàn: oracle đổi pha của đường an toàn. Xác suất vẫn giữ nguyên cho đến khi dùng giao thoa.
Turn the phase mark into probability¦Biến dấu pha thành xác suất
The oracle did not change the bars. Click Amplify once. In this practice room, exactly one of four paths is safe, so one round raises its probability to 100% in the ideal simulator. Other rooms can behave differently.¦Oracle không làm thay đổi các cột. Nhấn Khuếch đại một lần. Trong phòng này, đúng một trong bốn đường an toàn nên một vòng nâng xác suất của nó lên 100% trong mô phỏng lý tưởng. Các phòng khác có thể cho kết quả khác.
Read the bars, then move¦Đọc các cột rồi di chuyển
Compare the highlighted probability with its corridor letter and bit string. Click Measure & move to sample the circuit and enter that corridor. Extra amplification rounds can undo the improvement.¦Đối chiếu xác suất được tô sáng với chữ hành lang và chuỗi bit. Nhấn Đo và di chuyển để lấy mẫu từ mạch và đi vào hành lang đó. Khuếch đại thêm có thể làm mất sự cải thiện.
Safe is not the same as the exit¦An toàn không có nghĩa là lối ra
You found a safe dead end. Click Backtrack to return to the junction. The map remembers explored rooms; the oracle marks bomb safety, not the route to the destination.¦Bạn tìm thấy ngõ cụt an toàn. Nhấn Quay lại để trở về ngã rẽ. Bản đồ ghi nhớ các phòng đã khám phá; oracle đánh dấu nơi không có bom, không xác định đường đến đích.
Ready for your first mission¦Sẵn sàng cho nhiệm vụ đầu tiên
You allocated qubits, prepared superposition, marked safety, amplified, measured and backtracked. In regular missions, repeat at each junction until you reach the exit. Bombs cost a life; unused states leave you in place.¦Bạn đã cấp phát qubit, tạo chồng chập, đánh dấu an toàn, khuếch đại, đo và quay lại. Trong nhiệm vụ thường, lặp lại tại mỗi ngã rẽ đến khi tìm thấy lối ra. Bom làm mất một mạng; trạng thái không dùng khiến bạn đứng yên.
`.trim().split('\n').map(line => line.split('¦')));
