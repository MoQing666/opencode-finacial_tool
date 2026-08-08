' ============================================
' 财务自动化工具 - VBA模板
' 功能：自动化财务报表生成和数据处理
' ============================================

Option Explicit

' 主入口：生成财务报表
Sub GenerateFinancialReport()
    Dim wsData As Worksheet
    Dim wsReport As Worksheet
    Dim lastRow As Long
    Dim lastCol As Long
    
    ' 设置工作表
    Set wsData = ThisWorkbook.Sheets("财务数据")
    
    ' 创建或清空报表工作表
    On Error Resume Next
    Set wsReport = ThisWorkbook.Sheets("财务报表")
    If wsReport Is Nothing Then
        Set wsReport = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
        wsReport.Name = "财务报表"
    Else
        wsReport.Cells.Clear
    End If
    On Error GoTo 0
    
    ' 获取数据范围
    lastRow = wsData.Cells(wsData.Rows.Count, 1).End(xlUp).Row
    lastCol = wsData.Cells(1, wsData.Columns.Count).End(xlToLeft).Column
    
    ' 调用各模块生成报表
    Call CreateReportHeader(wsReport)
    Call CreateSummarySection(wsData, wsReport, lastRow, lastCol)
    Call CreateDetailSection(wsData, wsReport, lastRow, lastCol)
    Call CreateCharts(wsReport)
    Call FormatReport(wsReport)
    
    MsgBox "财务报表生成完成！", vbInformation, "完成"
End Sub

' 创建报表标题
Private Sub CreateReportHeader(ws As Worksheet)
    ws.Range("A1").Value = "财务综合报表"
    ws.Range("A1").Font.Size = 18
    ws.Range("A1").Font.Bold = True
    ws.Range("A1").Font.Color = RGB(31, 119, 180)
    
    ws.Range("A2").Value = "报表日期: " & Format(Now, "yyyy-mm-dd hh:mm:ss")
    ws.Range("A2").Font.Italic = True
    ws.Range("A2").Font.Color = RGB(102, 102, 102)
    
    ws.Range("A3").Value = "数据来源: 自动化导入"
    ws.Range("A3").Font.Italic = True
    ws.Range("A3").Font.Color = RGB(102, 102, 102)
End Sub

' 创建汇总部分
Private Sub CreateSummarySection(wsData As Worksheet, wsReport As Worksheet, lastRow As Long, lastCol As Long)
    Dim col As Long
    Dim sumRow As Long
    Dim colName As String
    
    ' 汇总标题
    wsReport.Range("A5").Value = "一、汇总统计"
    wsReport.Range("A5").Font.Size = 14
    wsReport.Range("A5").Font.Bold = True
    
    ' 表头
    wsReport.Range("A6").Value = "科目"
    wsReport.Range("B6").Value = "金额"
    wsReport.Range("C6").Value = "占比"
    wsReport.Range("D6").Value = "均值"
    wsReport.Range("E6").Value = "最大值"
    wsReport.Range("F6").Value = "最小值"
    
    ' 设置表头样式
    With wsReport.Range("A6:F6")
        .Font.Bold = True
        .Font.Color = RGB(255, 255, 255)
        .Interior.Color = RGB(31, 119, 180)
        .HorizontalAlignment = xlCenter
    End With
    
    ' 遍历数值列
    sumRow = 7
    For col = 1 To lastCol
        If IsNumeric(wsData.Cells(2, col).Value) Then
            colName = wsData.Cells(1, col).Value
            wsReport.Cells(sumRow, 1).Value = colName
            wsReport.Cells(sumRow, 2).Value = Application.WorksheetFunction.Sum(wsData.Range(wsData.Cells(2, col), wsData.Cells(lastRow, col)))
            wsReport.Cells(sumRow, 3).Value = wsReport.Cells(sumRow, 2).Value / GetTotalSum(wsData, lastRow, lastCol)
            wsReport.Cells(sumRow, 4).Value = Application.WorksheetFunction.Average(wsData.Range(wsData.Cells(2, col), wsData.Cells(lastRow, col)))
            wsReport.Cells(sumRow, 5).Value = Application.WorksheetFunction.Max(wsData.Range(wsData.Cells(2, col), wsData.Cells(lastRow, col)))
            wsReport.Cells(sumRow, 6).Value = Application.WorksheetFunction.Min(wsData.Range(wsData.Cells(2, col), wsData.Cells(lastRow, col)))
            
            ' 格式化
            wsReport.Cells(sumRow, 2).NumberFormat = "#,##0.00"
            wsReport.Cells(sumRow, 3).NumberFormat = "0.00%"
            wsReport.Cells(sumRow, 4).NumberFormat = "#,##0.00"
            wsReport.Cells(sumRow, 5).NumberFormat = "#,##0.00"
            wsReport.Cells(sumRow, 6).NumberFormat = "#,##0.00"
            
            sumRow = sumRow + 1
        End If
    Next col
    
    ' 添加边框
    With wsReport.Range("A6:F" & sumRow - 1)
        .Borders.LineStyle = xlContinuous
        .Borders.Weight = xlThin
    End With
End Sub

' 获取总金额
Private Function GetTotalSum(wsData As Worksheet, lastRow As Long, lastCol As Long) As Double
    Dim col As Long
    Dim total As Double
    
    For col = 1 To lastCol
        If IsNumeric(wsData.Cells(2, col).Value) Then
            total = total + Application.WorksheetFunction.Sum(wsData.Range(wsData.Cells(2, col), wsData.Cells(lastRow, col)))
        End If
    Next col
    
    GetTotalSum = total
End Function

' 创建明细部分
Private Sub CreateDetailSection(wsData As Worksheet, wsReport As Worksheet, lastRow As Long, lastCol As Long)
    Dim detailStartRow As Long
    
    detailStartRow = Application.WorksheetFunction.Max(15, lastRow + 10)
    
    wsReport.Cells(detailStartRow, 1).Value = "二、数据明细"
    wsReport.Cells(detailStartRow, 1).Font.Size = 14
    wsReport.Cells(detailStartRow, 1).Font.Bold = True
    
    ' 复制数据
    wsData.Range(wsData.Cells(1, 1), wsData.Cells(lastRow, lastCol)).Copy wsReport.Cells(detailStartRow + 1, 1)
    
    ' 设置表头样式
    With wsReport.Range(wsReport.Cells(detailStartRow + 1, 1), wsReport.Cells(detailStartRow + 1, lastCol))
        .Font.Bold = True
        .Font.Color = RGB(255, 255, 255)
        .Interior.Color = RGB(31, 119, 180)
        .HorizontalAlignment = xlCenter
    End With
    
    ' 添加边框
    With wsReport.Range(wsReport.Cells(detailStartRow + 1, 1), wsReport.Cells(detailStartRow + lastRow, lastCol))
        .Borders.LineStyle = xlContinuous
        .Borders.Weight = xlThin
    End With
End Sub

' 创建图表
Private Sub CreateCharts(wsReport As Worksheet)
    Dim chartObj As ChartObject
    Dim dataRange As Range
    Dim lastRow As Long
    
    lastRow = wsReport.Cells(wsReport.Rows.Count, 1).End(xlUp).Row
    
    ' 柱状图
    Set chartObj = wsReport.ChartObjects.Add(Left:=300, Top:=50, Width:=400, Height:=250)
    With chartObj.Chart
        .ChartType = xlColumnClustered
        .HasTitle = True
        .ChartTitle.Text = "各科目汇总"
        .Axes(xlCategory).HasTitle = True
        .Axes(xlCategory).AxisTitle.Text = "科目"
        .Axes(xlValue).HasTitle = True
        .Axes(xlValue).AxisTitle.Text = "金额"
        
        Set dataRange = wsReport.Range("A6:B" & 6 + lastRow - 7)
        .SetSourceData Source:=dataRange
    End With
    
    ' 饼图
    Set chartObj = wsReport.ChartObjects.Add(Left:=300, Top:=320, Width:=400, Height:=250)
    With chartObj.Chart
        .ChartType = xlPie
        .HasTitle = True
        .ChartTitle.Text = "占比分析"
        
        Set dataRange = wsReport.Range("A6:A" & 6 + lastRow - 7 & ",C6:C" & 6 + lastRow - 7)
        .SetSourceData Source:=dataRange
    End With
End Sub

' 格式化报表
Private Sub FormatReport(ws As Worksheet)
    ' 设置列宽
    ws.Columns("A").ColumnWidth = 15
    ws.Columns("B").ColumnWidth = 15
    ws.Columns("C").ColumnWidth = 12
    ws.Columns("D").ColumnWidth = 15
    ws.Columns("E").ColumnWidth = 15
    ws.Columns("F").ColumnWidth = 15
    
    ' 设置行高
    ws.Rows(1).RowHeight = 30
    ws.Rows(5).RowHeight = 25
    
    ' 冻结窗格
    ws.Range("A7").Select
    ActiveWindow.FreezePanes = True
End Sub

' ============================================
' 数据处理功能
' ============================================

' 按部门汇总
Sub SummarizeByDepartment()
    Dim wsData As Worksheet
    Dim wsSummary As Worksheet
    Dim lastRow As Long
    Dim deptCol As Long
    Dim amountCol As Long
    Dim dict As Object
    Dim i As Long
    Dim dept As String
    Dim amount As Double
    
    Set wsData = ThisWorkbook.Sheets("财务数据")
    lastRow = wsData.Cells(wsData.Rows.Count, 1).End(xlUp).Row
    
    ' 查找部门列和金额列
    deptCol = FindColumn(wsData, "部门")
    amountCol = FindColumn(wsData, "金额")
    
    If deptCol = 0 Or amountCol = 0 Then
        MsgBox "未找到部门或金额列！", vbExclamation
        Exit Sub
    End If
    
    ' 创建字典汇总
    Set dict = CreateObject("Scripting.Dictionary")
    
    For i = 2 To lastRow
        dept = CStr(wsData.Cells(i, deptCol).Value)
        amount = CDbl(wsData.Cells(i, amountCol).Value)
        
        If dict.Exists(dept) Then
            dict(dept) = dict(dept) + amount
        Else
            dict.Add dept, amount
        End If
    Next i
    
    ' 创建汇总工作表
    On Error Resume Next
    Set wsSummary = ThisWorkbook.Sheets("部门汇总")
    If wsSummary Is Nothing Then
        Set wsSummary = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
        wsSummary.Name = "部门汇总"
    Else
        wsSummary.Cells.Clear
    End If
    On Error GoTo 0
    
    ' 写入汇总数据
    wsSummary.Range("A1").Value = "部门汇总"
    wsSummary.Range("A1").Font.Size = 16
    wsSummary.Range("A1").Font.Bold = True
    
    wsSummary.Range("A3").Value = "部门"
    wsSummary.Range("B3").Value = "金额"
    wsSummary.Range("C3").Value = "占比"
    
    With wsSummary.Range("A3:C3")
        .Font.Bold = True
        .Font.Color = RGB(255, 255, 255)
        .Interior.Color = RGB(31, 119, 180)
    End With
    
    Dim row As Long
    Dim total As Double
    row = 4
    
    ' 计算总和
    total = 0
    For Each key In dict.Keys
        total = total + dict(key)
    Next key
    
    ' 写入数据
    For Each key In dict.Keys
        wsSummary.Cells(row, 1).Value = key
        wsSummary.Cells(row, 2).Value = dict(key)
        wsSummary.Cells(row, 3).Value = dict(key) / total
        
        wsSummary.Cells(row, 2).NumberFormat = "#,##0.00"
        wsSummary.Cells(row, 3).NumberFormat = "0.00%"
        
        row = row + 1
    Next key
    
    ' 添加边框
    With wsSummary.Range("A3:C" & row - 1)
        .Borders.LineStyle = xlContinuous
        .Borders.Weight = xlThin
    End With
    
    ' 添加图表
    Dim chartObj As ChartObject
    Set chartObj = wsSummary.ChartObjects.Add(Left:=200, Top:=50, Width:=400, Height:=300)
    With chartObj.Chart
        .ChartType = xlPie
        .HasTitle = True
        .ChartTitle.Text = "部门占比"
        .SetSourceData Source:=wsSummary.Range("A3:B" & row - 1)
    End With
    
    MsgBox "部门汇总完成！", vbInformation
End Sub

' 查找列
Private Function FindColumn(ws As Worksheet, colName As String) As Long
    Dim lastCol As Long
    Dim i As Long
    
    lastCol = ws.Cells(1, ws.Columns.Count).End(xlToLeft).Column
    
    For i = 1 To lastCol
        If ws.Cells(1, i).Value = colName Then
            FindColumn = i
            Exit Function
        End If
    Next i
    
    FindColumn = 0
End Function

' ============================================
' 导出功能
' ============================================

' 导出为PDF
Sub ExportToPDF()
    Dim ws As Worksheet
    Dim filePath As String
    
    Set ws = ThisWorkbook.Sheets("财务报表")
    
    filePath = Application.GetSaveAsFilename( _
        InitialFileName:="财务报表_" & Format(Now, "yyyymmdd"), _
        FileFilter:="PDF Files (*.pdf), *.pdf")
    
    If filePath <> "False" Then
        ws.ExportAsFixedFormat _
            Type:=xlTypePDF, _
            Filename:=filePath, _
            Quality:=xlQualityStandard, _
            IncludeDocProperties:=True, _
            IgnorePrintAreas:=False, _
            OpenAfterPublish:=True
        
        MsgBox "PDF导出成功！", vbInformation
    End If
End Sub

' 导出为Excel
Sub ExportToExcel()
    Dim filePath As String
    
    filePath = Application.GetSaveAsFilename( _
        InitialFileName:="财务报表_" & Format(Now, "yyyymmdd"), _
        FileFilter:="Excel Files (*.xlsx), *.xlsx")
    
    If filePath <> "False" Then
        ThisWorkbook.SaveAs Filename:=filePath, FileFormat:=xlOpenXMLWorkbook
        MsgBox "Excel导出成功！", vbInformation
    End If
End Sub

' ============================================
' 工具函数
' ============================================

' 清空报表
Sub ClearReport()
    Dim ws As Worksheet
    
    If MsgBox("确定要清空报表吗？", vbYesNo + vbQuestion) = vbYes Then
        For Each ws In ThisWorkbook.Sheets
            If ws.Name <> "财务数据" Then
                Application.DisplayAlerts = False
                ws.Delete
                Application.DisplayAlerts = True
            End If
        Next ws
        
        MsgBox "报表已清空！", vbInformation
    End If
End Sub

' 刷新数据
Sub RefreshData()
    Dim wsData As Worksheet
    
    Set wsData = ThisWorkbook.Sheets("财务数据")
    
    ' 这里可以添加数据刷新逻辑
    ' 例如从数据库或外部文件读取数据
    
    MsgBox "数据刷新完成！", vbInformation
End Sub

' 显示帮助
Sub ShowHelp()
    Dim helpMsg As String
    
    helpMsg = "财务自动化工具使用说明" & vbCrLf & vbCrLf
    helpMsg = helpMsg & "1. 生成报表: 自动生成财务综合报表" & vbCrLf
    helpMsg = helpMsg & "2. 部门汇总: 按部门汇总财务数据" & vbCrLf
    helpMsg = helpMsg & "3. 导出PDF: 将报表导出为PDF格式" & vbCrLf
    helpMsg = helpMsg & "4. 导出Excel: 将报表导出为Excel格式" & vbCrLf
    helpMsg = helpMsg & "5. 清空报表: 清除所有生成的报表" & vbCrLf
    helpMsg = helpMsg & "6. 刷新数据: 重新加载数据" & vbCrLf
    
    MsgBox helpMsg, vbInformation, "帮助"
End Sub
