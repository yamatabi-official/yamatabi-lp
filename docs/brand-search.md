# YAMATABI（ヤマタビ）のブランド検索（2026-10-26）

## 実装
- 正式な表示名はYAMATABI、カナの別名はヤマタビ。ページ名・description・トップのABOUT本文で `YAMATABI（ヤマタビ）` を自然に併記する。ロゴとユーザー依頼で整理したHEROにはカナや追加コピーを置かない。
- トップのtitleは `YAMATABI（ヤマタビ）公式｜物語から、あなたの旅へ`。作品・計画ページのtitleにもブランドの両表記を付ける。
- トップ/作品のOGP、SNSカードのタイトル・説明・既存画像を設定。存在しないSNSアカウントやロゴ素材を捏造しない。
- 全3ページに自己参照canonical。トップは https://yamatabi-official.github.io/yamatabi-lp/ に統一し、index.htmlの重複URLやアンカーを代表URLに含めない。canonicalは検索エンジンへの推奨で、HTTPリダイレクトではない。
- トップにOrganization（name=YAMATABI、alternateName=ヤマタビ、公式InstagramのsameAs）、WebSite、WebPageのJSON-LDを設定。作品にはWebPageを設定。法人名・所在地・ロゴ・公開日・受賞歴・動画のuploadDate等は確認できていないため追加しない。
- sitemap.xmlはトップとexperience.htmlの2つのcanonical URL。lastmodは実際に変更した日付とし、内容が変わらないのに毎日更新しない。
- 個人用の計画メモ画面はnoindex,followとし、サイトマップから除外。ページ自体と保存/共有機能は従来どおり使える。noindexはアクセス制限ではない。

## GitHub Pagesの範囲
このサイトはgithub.ioのプロジェクト配下（/yamatabi-lp/）で配信される。robots.txtはホスト直下に置かないとクローラー制御に使われないため、プロジェクト内に効かないrobots.txtを作って「対応済み」とはしない。Search Consoleからサイトマップを直接送信できる。
構造化データはブランドの内容を伝えるための記述。Googleの検索結果のサイト名表示はサブディレクトリではサポート条件が異なり、WebSiteを置けば表示名が採用されるとは限らない。掲載・順位・名称表示・AIからの引用は保証しない。

## Google Search Consoleで行うこと（未実施）
サイトのコード整備だけでは、Googleへの登録状況や掲載の有無は確認できない。Googleアカウントの操作/所有権確認はこの作業では行っていない。

1. https://search.google.com/search-console/welcome を開く。未登録なら「URLプレフィックス」で `https://yamatabi-official.github.io/yamatabi-lp/` を追加する。github.io全体のドメイン所有権を登録する操作ではない。登録済みなら対応するプロパティを選ぶ。
2. 未確認なら、Googleが提示するHTMLタグまたはHTMLファイルで所有権を確認する。確認用タグ/ファイルの正しい値はGoogleの画面から得る必要がある。架空の確認タグ・IDを入れない。受け取ったらトップのheadへタグ追加、または指定のHTMLファイルを配置して公開してから確認する。
3. 「サイトマップ」で `https://yamatabi-official.github.io/yamatabi-lp/sitemap.xml` を送信する（入力欄によっては `sitemap.xml` のみ）。
4. 「URL検査」でトップのcanonical URLを確認し、未登録ならインデックス登録をリクエストする。作品ページも確認する。受付は掲載・順位の保証ではない。
5. 掲載後は「検索パフォーマンス」でYAMATABI/ヤマタビの表示回数・クリックを確認する。検索結果の反映には時間がかかる場合がある。

## 運用
Instagramのプロフィール名・自己紹介にも `YAMATABI（ヤマタビ）` を使い、公式サイトへのリンクを揃えるとブランドを説明しやすい。Instagram自体は今回変更していない。
作品を追加したらtitle/description/canonicalと、公開するURLのサイトマップ登録を見直す。予約/保存/設定用の画面を無差別にサイトマップへ入れない。キーワードの不自然な反復や隠しテキストを加えない。

## 確認
HTMLからcanonical/metadata/JSON-LDを読み出し、JSON解析・画像参照・XMLサイトマップを検証。ローカルHTTP配信を確認。Chromiumのスマホ/PC幅でブランド表記、元のHERO、作品マップ、計画画面の入力を確認する。Google検索/Google公式ドキュメントへの接続は環境のプロキシで403となり、実際の掲載状況やSearch Consoleの所有権は未確認。
