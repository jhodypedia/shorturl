<h3>Analytics for <%= url.shortCode %></h3>
<p>Original: <a href="<%= url.originalUrl %>" target="_blank"><%= url.originalUrl %></a></p>
<p>Total Clicks: <%= url.clicks %></p>

<div class="table-responsive">
  <table class="table table-sm">
    <thead><tr><th>#</th><th>Time</th><th>IP</th><th>Country</th><th>City</th><th>Referrer</th><th>User Agent</th></tr></thead>
    <tbody>
      <% clicks.forEach((c,i)=>{ %>
      <tr>
        <td><%= i+1 %></td>
        <td><%= c.createdAt.toLocaleString() %></td>
        <td><%= c.ip %></td>
        <td><%= c.country||'-' %></td>
        <td><%= c.city||'-' %></td>
        <td><%= c.referrer||'-' %></td>
        <td class="text-break" style="max-width:400px"><%= c.userAgent %></td>
      </tr>
      <% }) %>
    </tbody>
  </table>
</div>
