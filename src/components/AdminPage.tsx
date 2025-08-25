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

  console.log("AdminPage - 받은 예약 데이터:", reservations);

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

  const handleDelete = (id: string) => {
    if (window.confirm("정말로 이 신청을 삭제하시겠습니까?")) {
      onDelete(id);
    }
  };

  const exportToCSV = () => {
    const headers = ["이름", "학번", "호실", "전화번호", "시작날짜", "종료날짜", "사용기간", "시작시간", "종료시간", "신청일시"];
    const csvContent = [
      headers.join(","),
      ...filteredReservations.map((reservation) => {
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

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `reservations_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          CSV 다운로드
        </button>
      </div>

      <div className="reservations-table">
        <table>
          <thead>
            <tr>
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
              <th>관리</th>
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
                    <td>
                      <button
                        onClick={() => handleDelete(reservation.id)}
                        className="delete-btn"
                      >
                        삭제
                      </button>
                    </td>
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
