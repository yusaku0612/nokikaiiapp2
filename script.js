new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  data: {
    activeTab: 'register',  // 初期タブはイベント登録
    eventDate: '',
    eventName: '',
    participants: '',
    totalAmount: 0,
    paymentFlag: false,
    calculationResult: null,
    searchType: 'date',  // 初期検索条件は日付
    searchDate: '',
    searchEventName: '',
    searchName: '',
    searchResults: []  // 検索結果を格納する配列
  },
  watch: {
    // タブが切り替わったときに計算結果をリセット
    activeTab(newTab) {
      if (newTab === 'search') {
        this.calculationResult = null;
      }
    }
  },
  methods: {
    async saveNomikaiEvent() {
      try {
        const participantList = this.participants.split('、').map(p => p.trim());
        const numberOfParticipants = participantList.length;
        const amountPerParticipant = this.totalAmount / numberOfParticipants;

        const response = await fetch('https://m3h-beerkn-functionapp.azurewebsites.net/api/savenomikai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            EventDate: this.eventDate,
            EventName: this.eventName,
            Participants: this.participants,
            Amount: this.totalAmount,
            PaymentFlag: this.paymentFlag
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to save nomikai event: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Response Body:', data);

        this.calculationResult = amountPerParticipant;
        alert(data.message || '飲み会イベントの保存が成功しましたが、メッセージがありません。');
      } catch (error) {
        console.error('Error:', error);
        alert('エラーが発生しました。飲み会イベントの保存に失敗しました。');
      }
    },
    async searchNomikaiEvent() {
      try {
        let url = 'https://m3h-beerkn-functionapp.azurewebsites.net/api/nomikai/search?';

        if (this.searchType === 'date') {
          url += `eventdate=${this.searchDate}`;
        } else if (this.searchType === 'eventName') {
          url += `eventname=${encodeURIComponent(this.searchEventName)}`;
        } else if (this.searchType === 'name') {
          url += `name=${encodeURIComponent(this.searchName)}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to search nomikai events: ${response.status} ${response.statusText} - ${errorText}`);
        }

        this.searchResults = await response.json();
        console.log('Search Results:', this.searchResults);
      } catch (error) {
        console.error('Error:', error);
        alert('エラーが発生しました。イベントの検索に失敗しました。');
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(dateString).toLocaleDateString('ja-JP', options);
    }
  }
});