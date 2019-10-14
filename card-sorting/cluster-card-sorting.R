getCardSortingClusters <- function(datasets){
  
  # getting all cards from all datasets
  cards <- c()
  for(i in 1:length(datasets)){
    ds <- datasets[[i]]
    if(!is.null(ds$file)){
      datasets[[i]]$data = read.csv(file=ds$file, header = T, sep = ",");
      for(v in datasets[[i]]$data){
        cards = c(cards, levels(v));
      }
    }
  }
  # getting unique cards and ignore empty cells
  cards = unique(cards[cards != ""])
  columns <- c("Name", "Cluster", cards)
  
  # creating "transaction" structure
  # see association rules: https://www.datacamp.com/community/tutorials/market-basket-analysis-r
  base_df = data.frame(matrix(NA, ncol=length(columns)))
  colnames(base_df) <- columns
  
  # transform data into the structure
  for(ds in datasets){
    for(i in 1:length(ds$data)){
      v = ds$data[[i]]
      row <- columns %in% v
      row[1] = ds$name
      row[2] = colnames(ds$data)[i]
      df = data.frame(matrix(row, nrow=1))
      colnames(df) <- columns
      base_df = rbind(base_df, df)
    }
  }
  # remove NA rows
  base_df = base_df[complete.cases(base_df),]
  base_df[,3:length(base_df)] = as.logical(base_df[,3:length(base_df)] == "TRUE")
  
  # measure "distance" between variables and fill matrix
  measure_df = base_df[,3:length(base_df)]
  measure_names = colnames(measure_df)
  dist_matrix = matrix(1, nrow = length(measure_df), ncol = length(measure_df))
  colnames(dist_matrix) = measure_names
  rownames(dist_matrix) = measure_names
  
  for(i in 1:length(measure_names)){
    first = measure_names[[i]]
    for (j in 1:length(measure_names)){
      second = measure_names[[j]]
      if(first != second){
        # calculate "distance" between the two
        #if(first == "Estado do veículo" && second == "Ano do veículo"){
        compare = measure_df[,c(first, second)]
        # count TRUE entries
        firstCount = length(which(compare[,1] == TRUE))
        secondCount = length(which(compare[,2] == TRUE))
        greaterCount = if(firstCount > secondCount) firstCount else secondCount
        bothCount = length(which(compare[,1] & compare[,2] == TRUE))
        
        # calculate "distance" from co-ocurrence
        dist = bothCount / greaterCount
        dist = 1 - dist
        #if(dist == 0) dist = 0.01 # if if gets to zero, apply just a non-zero value
        
        dist_matrix[i,j] = dist
        dist_matrix[j,i] = dist
        #}
      }
    }
  }
  hclust <- hclust(as.dist(dist_matrix), method = 'average')
  res = list(
    hclust = hclust,
    dist_matrix = dist_matrix
  )
  return(res)
}

getClusterTable <- function(hclust=NULL, k=2){
  cut = cutree(hclust, k=k)
  cut_df = data.frame(cut)
  colnames(cut_df) <- c("Cluster")
  cut_df$Card = rownames(cut_df)
  rownames(cut_df) <- NULL
  for(c in unique(cut_df$Cluster)){
    # get list of cards for this cluster number and complete vector with empty strings
    cards = cut_df[cut_df$Cluster == c, "Card"]
    cut_df[paste("Cluster ", c)] = c(cards, vector(mode="character", length =(nrow(cut_df)-length(cards)) ))
  }
  return(cut_df[,-c(1,2)])
}
