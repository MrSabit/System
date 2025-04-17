@bp.route('/api/study_hours', methods=['POST'])
@login_required
def get_study_hours():
    data = request.get_json()
    view = data.get('view', 'weekly')
    
    if view == 'weekly':
        # Get data for the last 7 days
        today = datetime.now().date()
        dates = [(today - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(6, -1, -1)]
        
        # Get all study sessions for the user in the past 7 days
        study_sessions = StudySession.query.filter_by(user_id=g.user.id).filter(
            StudySession.date >= today - timedelta(days=6)  # Get only sessions from the past 7 days
        ).order_by(StudySession.date).all()
        
        # Process data for the chart, initialize with all 7 days
        hours_by_date = {}
        
        # Initialize with the last 7 days to ensure they appear even if no data
        for date in dates:
            hours_by_date[date] = 0
        
        # Add hours for each day from the sessions
        for session in study_sessions:
            session_date = session.date.strftime('%Y-%m-%d')
            if session_date in hours_by_date:
                hours_by_date[session_date] += session.hours
        
        # Use the ordered dates to keep the correct sequence
        chart_labels = [datetime.strptime(date, '%Y-%m-%d').strftime('%a, %b %d') for date in dates]
        chart_data = [hours_by_date[date] for date in dates]
        
        return jsonify({
            'success': True,
            'labels': chart_labels,
            'data': chart_data
        })
    
    elif view == 'monthly':
        # Get month and year from request, default to current month
        month = data.get('month', datetime.now().month)
        year = data.get('year', datetime.now().year)
        
        # Create date for the first day of the specified month
        current_month = datetime(year, month, 1).date()
        
        # Calculate days in the specified month
        if month == 12:
            next_month = datetime(year + 1, 1, 1).date()
        else:
            next_month = datetime(year, month + 1, 1).date()
        days_in_month = (next_month - current_month).days
        
        # Create a list of all days in the specified month
        month_dates = [(current_month + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(days_in_month)]
        
        # Get all study sessions for the user in the specified month
        study_sessions = StudySession.query.filter_by(user_id=g.user.id).filter(
            StudySession.date >= current_month,
            StudySession.date < next_month
        ).order_by(StudySession.date).all()
        
        # Initialize hours for each day of the month
        hours_by_date = {date: 0 for date in month_dates}
        
        # Add study hours for each day
        for session in study_sessions:
            session_date = session.date.strftime('%Y-%m-%d')
            if session_date in hours_by_date:
                hours_by_date[session_date] += session.hours
        
        # Format labels to show just the day number
        chart_labels = [datetime.strptime(date, '%Y-%m-%d').strftime('%d') for date in month_dates]
        chart_data = [hours_by_date[date] for date in month_dates]
        
        # Add month name to the response for display purposes
        month_name = current_month.strftime('%B %Y')
        
        return jsonify({
            'success': True,
            'labels': chart_labels,
            'data': chart_data,
            'month': month_name,
            'month_number': month,
            'year': year
        })
    
    elif view == 'yearly':
        # Get requested year from request, default to current year
        year = data.get('year', datetime.now().year)
        
        # Create a list of all months in the year
        months = []
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        # Get all study sessions for the user in the requested year
        start_date = datetime(year, 1, 1).date()
        end_date = datetime(year + 1, 1, 1).date()
        
        study_sessions = StudySession.query.filter_by(user_id=g.user.id).filter(
            StudySession.date >= start_date,
            StudySession.date < end_date
        ).order_by(StudySession.date).all()
        
        # Initialize hours for each month
        hours_by_month = {month: 0 for month in range(1, 13)}
        
        # Add study hours for each month
        for session in study_sessions:
            month = session.date.month
            hours_by_month[month] += session.hours
        
        # Prepare data for chart
        chart_labels = month_names
        chart_data = [hours_by_month[m] for m in range(1, 13)]
        
        return jsonify({
            'success': True,
            'labels': chart_labels,
            'data': chart_data,
            'year': year
        })
    
    return jsonify({
        'success': False,
        'message': 'Invalid view type specified'
    }) 