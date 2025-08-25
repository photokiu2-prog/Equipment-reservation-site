import React, { useState, useEffect } from "react";
import { Reservation } from "../types";
import { sanitizeInput } from "../utils";
import "./AdminPage.css";

interface AdminPageProps {
  reservations: Reservation[];
  onDelete: (id: string) => void;
  onLogout: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ reservations, onDelete, onLogout }) => {
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30);
  
  // 체크박스 선택 상태
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  console.log("🏢 AdminPage - 받은 예약 데이터:", reservations);
  console.log("📊 총 예약 수:", reservations.length);
  console.log("🔍 필터링된 예약 수:", filteredReservations.length);

  useEffect(() => {
    let filtered = reservations;

    if (searchTerm) {
      const sanitizedSearchTerm = sanitizeInput(searchTerm).toLowerCase();
      filtered = filtered.filter(
        (reservation) =>
          reservation.name.toLowerCase().includes(sanitizedSearchTerm) ||
          reservation.studentId.includes(sanitizedSearchTerm) ||
          reservation.roomNumber.includes(sanitizedSearchTerm)
      );
    }

    if (startDateFilter && endDateFilter) {
      filtered = filtered.filter((reservation) => {
        const reservationStart = new Date(reservation.startDate);
        const reservationEnd = new Date(reservation.endDate);
        const filterStart = new Date(startDateFilter);
        const filterEnd = new Date(endDateFilter);
        
        // 신청 기간이 필터 기간과 겹치는지 확인
        return (
          (reservationStart <= filterEnd && reservationEnd >= filterStart) ||
          (reservationStart >= filterStart && reservationStart <= filterEnd) ||
          (reservationEnd >= filterStart && reservationEnd <= filterEnd)
        );
      });
    } else if (startDateFilter) {
      // 시작 날짜만 있는 경우
      filtered = filtered.filter((reservation) => {
        const reservationStart = new Date(reservation.startDate);
        const filterStart = new Date(startDateFilter);
        return reservationStart >= filterStart;
      });
    } else if (endDateFilter) {
      // 종료 날짜만 있는 경우
      filtered = filtered.filter((reservation) => {
        const reservationEnd = new Date(reservation.endDate);
        const filterEnd = new Date(endDateFilter);
        return reservationEnd <= filterEnd;
      });
    }

    setFilteredReservations(filtered);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
    setSelectedItems(new Set()); // 필터 변경 시 선택 상태 초기화
    setSelectAll(false);
  }, [reservations, searchTerm, startDateFilter, endDateFilter]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReservations = filteredReservations.slice(startIndex, endIndex);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // 페이지 상단으로 스크롤
  };

  // 체크박스 관련 핸들러들
  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
    
    // 현재 페이지의 모든 항목이 선택되었는지 확인
    const allCurrentIds = new Set(currentReservations.map(item => item.id));
    setSelectAll(allCurrentIds.size > 0 && allCurrentIds.size === newSelected.size);
  };

  const handleSelectAllOnCurrentPage = (checked: boolean) => {
    if (checked) {
      const currentIds = new Set(currentReservations.map(item => item.id));
      const newSelected = new Set([...Array.from(selectedItems), ...Array.from(currentIds)]);
      setSelectedItems(newSelected);
    } else {
      const currentIds = new Set(currentReservations.map(item => item.id));
      const newSelected = new Set(Array.from(selectedItems));
      currentIds.forEach(id => newSelected.delete(id));
      setSelectedItems(newSelected);
    }
    setSelectAll(checked);
  };

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    const confirmMessage = `선택된 ${selectedItems.size}개의 신청을 정말로 삭제하시겠습니까?`;
    if (window.confirm(confirmMessage)) {
      console.log("🗑️ 선택된 항목 삭제 시작:", Array.from(selectedItems));
      
      // 선택된 항목들을 삭제
      selectedItems.forEach(id => {
        console.log("🗑️ 삭제 중 - ID:", id);
        onDelete(id);
      });
      
      // 선택 상태 초기화
      setSelectedItems(new Set());
      setSelectAll(false);
      
      console.log("🗑️ 선택된 항목 삭제 완료");
      alert(`${selectedItems.size}개의 신청이 삭제되었습니다.`);
    }
  };

  const exportToCSV = () => {
    // 선택된 항목이 있으면 선택된 항목만, 없으면 전체 다운로드
    const itemsToExport = selectedItems.size > 0 
      ? filteredReservations.filter(item => selectedItems.has(item.id))
      : filteredReservations;

    if (itemsToExport.length === 0) {
      alert("다운로드할 항목이 없습니다.");
      return;
    }

    const headers = ["이름", "학번", "호실", "전화번호", "시작날짜", "종료날짜", "사용기간", "시작시간", "종료시간", "신청일시"];
    const csvContent = [
      headers.join(","),
      ...itemsToExport.map((reservation) => {
        const start = new Date(reservation.startDate);
        const end = new Date(reservation.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        return [
          reservation.name,
          reservation.studentId,
          reservation.roomNumber,
          reservation.phoneNumber,
          reservation.startDate,
          reservation.endDate,
          `${days}일`,
          reservation.startTime,
          reservation.endTime,
          reservation.createdAt,
        ].join(",");
      }),
    ].join("\n");

    const fileName = selectedItems.size > 0 
      ? `selected_reservations_${new Date().toISOString().split("T")[0]}.csv`
      : `all_reservations_${new Date().toISOString().split("T")[0]}.csv`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 다운로드 후 선택 상태 초기화
    setSelectedItems(new Set());
    setSelectAll(false);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStartDateFilter("");
    setEndDateFilter("");
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>레지던시 작업룸 사용신청 현황</h2>
        <button onClick={onLogout} className="logout-btn-header">
          로그아웃
        </button>
      </div>
      
      <div className="admin-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="이름, 학번, 호실로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="date-range-section">
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="date-filter"
              placeholder="시작 날짜"
            />
            <span className="date-separator">~</span>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="date-filter"
              placeholder="종료 날짜"
            />
          </div>
          <button onClick={clearFilters} className="clear-btn">
            필터 초기화
          </button>
        </div>
        
        <button onClick={exportToCSV} className="export-btn">
          CSV 다운로드 {selectedItems.size > 0 && `(${selectedItems.size}개 선택)`}
        </button>
        <button 
          onClick={handleDeleteSelected} 
          className="delete-selected-btn"
          disabled={selectedItems.size === 0}
        >
          선택된 항목 삭제 {selectedItems.size > 0 && `(${selectedItems.size}개)`}
        </button>
      </div>

      <div className="reservations-table">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAllOnCurrentPage(e.target.checked)}
                  title="현재 페이지 전체 선택"
                />
              </th>
              <th>이름</th>
              <th>학번</th>
              <th>호실</th>
              <th>전화번호</th>
              <th>시작날짜</th>
              <th>종료날짜</th>
              <th>사용기간</th>
              <th>시작시간</th>
              <th>종료시간</th>
              <th>신청일시</th>
            </tr>
          </thead>
                      <tbody>
              {currentReservations.length === 0 ? (
                <tr>
                  <td colSpan={11} className="no-data">
                    신청 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                currentReservations.map((reservation) => {
                const start = new Date(reservation.startDate);
                const end = new Date(reservation.endDate);
                const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                
                return (
                  <tr key={reservation.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.has(reservation.id)}
                        onChange={(e) => handleSelectItem(reservation.id, e.target.checked)}
                      />
                    </td>
                    <td>{reservation.name}</td>
                    <td>{reservation.studentId}</td>
                    <td>{reservation.roomNumber}</td>
                    <td>{reservation.phoneNumber}</td>
                    <td>{reservation.startDate}</td>
                    <td>{reservation.endDate}</td>
                    <td>{days}일</td>
                    <td>{reservation.startTime}</td>
                    <td>{reservation.endTime}</td>
                    <td>{reservation.createdAt}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="summary">
        <p>총 신청 건수: {filteredReservations.length}건</p>
        <p>현재 페이지: {currentPage} / {totalPages} (페이지당 {itemsPerPage}건)</p>
        {startDateFilter && endDateFilter && (
          <p>조회 기간: {startDateFilter} ~ {endDateFilter}</p>
        )}
      </div>

      {/* 페이지네이션 UI */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(1)} 
            disabled={currentPage === 1}
            className="page-btn"
          >
            처음
          </button>
          
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className="page-btn"
          >
            이전
          </button>
          
          {/* 페이지 번호들 */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            다음
          </button>
          
          <button 
            onClick={() => handlePageChange(totalPages)} 
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            마지막
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
